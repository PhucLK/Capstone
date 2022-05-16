export interface CreateTodoRequest {
  name: string
  dueDate: string
}

export interface UpdateTodoRequest {
  name: string
  dueDate: string
  done: boolean
}

export interface TodoItem {
  userId: string
  id: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
