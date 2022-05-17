import dateFormat from "dateformat";
import { History } from "history";
import update from "immutability-helper";
import * as React from "react";
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Popup,
  Table,
} from "semantic-ui-react";

import {
  createTodo,
  deleteTodo,
  download,
  getDownloadUrl,
  getTodos,
  patchTodo,
  removeAttachment,
} from "../api/todos-api";
import Auth from "../auth/Auth";
import { Todo } from "../types/Todo";

interface TodosProps {
  auth: Auth;
  history: History;
}

interface TodosState {
  todos: Todo[];
  newTodoName: string;
  loadingTodos: boolean;
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: "",
    loadingTodos: true,
  };

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value });
  };

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`);
  };

  onRemoveAttachmentButtonClick = async (todo: Todo) => {
    try {
      const todoId = todo.id;
      if (todo.attachmentUrl) {
        const attachmentUrl = todo.attachmentUrl;
        const attachmentUrlParts = attachmentUrl.split("/");
        const length = attachmentUrlParts.length;
        const s3Key = `${attachmentUrlParts[length - 2]}/${
          attachmentUrlParts[length - 1]
        }`;
        await removeAttachment(this.props.auth.getIdToken(), todoId, s3Key);
        //
        let updatedTodos: Todo[] = [];
        this.state.todos.forEach(function (todo) {
          if (todo.id === todoId) {
            todo.attachmentUrl = "";
            updatedTodos.push(todo);
          } else {
            updatedTodos.push(todo);
          }
        });
        this.setState({
          todos: updatedTodos,
        });
      }
    } catch (error) {
      console.log("Failed to remove attachment..!");
    }
  };

  onDownloadAttachment = async (todoId: string) => {
    const todo = this.state.todos.find((todo) => todo.id === todoId);
    if (todo?.attachmentUrl) {
      const attachmentUrl = todo.attachmentUrl;
      const attachmentUrlParts = attachmentUrl.split("/");
      const length = attachmentUrlParts.length;
      const s3Key = `${attachmentUrlParts[length - 2]}/${
        attachmentUrlParts[length - 1]
      }`;

      const downloadUrl = await getDownloadUrl(
        this.props.auth.getIdToken(),
        s3Key
      );
      console.log("Download URL: ", downloadUrl);
      download(downloadUrl, attachmentUrlParts[length - 1]);
    }
  };

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate();
      if (this.state.newTodoName.length > 0) {
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
          name: this.state.newTodoName,
          dueDate,
        });
        this.setState({
          todos: [...this.state.todos, newTodo],
          newTodoName: "",
        });
      } else {
        alert("Task name can't be empty");
      }
    } catch {
      alert("Todo creation failed");
    }
  };

  onTodoDelete = async (todo: Todo) => {
    try {
      const todoId = todo.id;
      if (todo?.attachmentUrl) {
        const attachmentUrl = todo.attachmentUrl;
        const attachmentUrlParts = attachmentUrl.split("/");
        const length = attachmentUrlParts.length;
        const s3Key = `${attachmentUrlParts[length - 2]}/${
          attachmentUrlParts[length - 1]
        }`; 
        await deleteTodo(this.props.auth.getIdToken(), todoId, s3Key);
        this.setState({
          todos: this.state.todos.filter((todo) => todo.id !== todoId),
        });
      } else {
        await deleteTodo(this.props.auth.getIdToken(), todoId);
        this.setState({
          todos: this.state.todos.filter((todo) => todo.id !== todoId),
        });
      }
    } catch {
      alert("Todo deletion failed");
    }
  };

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos];
      await patchTodo(this.props.auth.getIdToken(), todo.id, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done,
      });
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } },
        }),
      });
    } catch {
      alert("Update todo failed!");
    }
  };

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken());
      this.setState({
        todos,
        loadingTodos: false,
      });
    } catch (e) {
      alert(`Failed to fetch todos: ${e}`);
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>
        {this.renderCreateTodoInput()}
        {this.state.todos.length > 0 && this.renderTodos()}
      </div>
    );
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: "teal",
              labelPosition: "left",
              icon: "add",
              content: "New task",
              onClick: this.onTodoCreate,
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    );
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading();
    }

    return this.renderTodosList();
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    );
  }

  renderTodosList() {
    return (
      <Table celled padded>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign="center">Done</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Task Name</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Attachments</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Due Date</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.state.todos.map((todo, pos) => {
            return (
              <Table.Row key={todo.id}>
                <Table.Cell textAlign="center" width={1}>
                  <Popup
                    content="Mark completed"
                    trigger={
                      <Checkbox
                        onChange={() => this.onTodoCheck(pos)}
                        checked={todo.done}
                      />
                    }
                  />
                </Table.Cell>
                <Table.Cell width={7}> {todo.name}</Table.Cell>
                <Table.Cell width={3}>
                  {" "}
                  {todo.attachmentUrl && (
                    <Image size="tiny" src={todo.attachmentUrl} />
                  )}
                </Table.Cell>
                <Table.Cell width={2}> {todo.dueDate}</Table.Cell>
                <Table.Cell width={3} textAlign="center">
                  {" "}
                  {todo.attachmentUrl && (
                    <Popup
                      content="Download attachment"
                      trigger={
                        <Button
                          icon
                          color="green"
                          onClick={() => this.onDownloadAttachment(todo.id)}
                        >
                          <Icon name="download" />
                        </Button>
                      }
                    />
                  )}
                  {todo.attachmentUrl && (
                    <Popup
                      content="Remove attachment"
                      trigger={
                        <Button
                          icon
                          color="orange"
                          onClick={() =>
                            this.onRemoveAttachmentButtonClick(todo)
                          }
                        >
                          <Icon name="unlinkify" />
                        </Button>
                      }
                    />
                  )}
                  <Popup
                    content="Update attachment"
                    trigger={
                      <Button
                        icon
                        color="blue"
                        onClick={() => this.onEditButtonClick(todo.id)}
                      >
                        <Icon name="pencil" />
                      </Button>
                    }
                  />
                  <Popup
                    content="Delete"
                    trigger={
                      <Button
                        icon
                        color="red"
                        onClick={() => this.onTodoDelete(todo)}
                      >
                        <Icon name="delete" />
                      </Button>
                    }
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  }

  calculateDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);

    return dateFormat(date, "yyyy-mm-dd") as string;
  }
}
