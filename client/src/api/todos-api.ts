import Axios from "axios";

import { apiEndpoint } from "../config";
import { Todo } from "../types/Todo";
import { CreateTodoRequest } from "../types/CreateTodoRequest";
import { UpdateTodoRequest } from "../types/UpdateTodoRequest";

const FileDownload = require('js-file-download')

export async function getTodos(idToken: string): Promise<Todo[]> {
  console.log("Fetching todos");

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  console.log("Todos:", response.data);
  return response.data.items;
}

export async function createTodo(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Todo> {
  const response = await Axios.post(
    `${apiEndpoint}/todos`,
    JSON.stringify(newTodo),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return response.data.item;
}

export async function patchTodo(
  idToken: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/todos/${todoId}`,
    JSON.stringify(updatedTodo),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
}

export async function patchTodoAttachment(
  idToken: string,
  todoId: string,
  s3Key: string
): Promise<void> {
  await Axios.put(
    `${apiEndpoint}/todos/${todoId}/attachment`,
    {
      s3Key
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
}

export async function deleteTodo(
  idToken: string,
  todoId: string,
  s3Key?: string
): Promise<void> {
  await Axios.post(`${apiEndpoint}/todos/delete-item`, {
    todoId, s3Key
  }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function removeAttachment(
  idToken: string,
  todoId: string,
  s3Key: string
) {
  await Axios.post(`${apiEndpoint}/todos/delete-attachment`, {
    todoId, s3Key
  }, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function getUploadUrl(
  idToken: string,
  s3Key: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/todos/upload-attachment`, {
      s3Key
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return response.data.uploadUrl;
}

export async function getDownloadUrl(
  idToken: string,
  s3Key: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/todos/download-attachment`, {
      s3Key
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return response.data.downloadUrl;
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file);
}

export function download(url: string, filename: string) {
  Axios({
    url,
    method: 'GET',
    responseType: 'blob',
  }).then((response) => {
      FileDownload(response.data, filename);
  });
}