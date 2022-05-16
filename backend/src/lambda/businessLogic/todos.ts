import * as uuid from 'uuid';

import { TodoItem, CreateTodoRequest, UpdateTodoRequest } from '../types/Todo';
import { TodoAccess } from '../dataLayer/todo';

const todoAccess = new TodoAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosForUser(userId);
}

export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
  return todoAccess.getTodo(userId, todoId);
}

export async function updateTodo(userId: string, id: string, payload: UpdateTodoRequest) : Promise<void>{
  return todoAccess.updateTodo(userId, id, payload);
}

export async function updateTodoAttachment(userId: string, id: string): Promise<void> {
  return todoAccess.updateTodoAttachment(userId, id);
}

export async function deleteTodo(userId: string, id: string): Promise<void> {
  return todoAccess.deleteTodo(userId, id);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const id = uuid.v4();

  return await todoAccess.createTodo({
    id,
    userId,
    name: createTodoRequest.name,
    done: false,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate
  })
}

export async function todoExists(id: string): Promise<boolean> {
  return await todoAccess.todoExists(id);
}
