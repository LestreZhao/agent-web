import { type Workflow } from "~/core/workflow";

export type MessageRole = "user" | "assistant";

interface GenericMessage<
  T extends string,
  C extends Record<string, unknown> | string,
> {
  id: string;
  role: MessageRole;
  type: T;
  content: C;
}

export interface TextMessage extends GenericMessage<"text", string> {}

export interface WorkflowMessage
  extends GenericMessage<"workflow", { workflow: Workflow }> {}

export type Message = TextMessage | WorkflowMessage;
export type UploadedFile = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

export type ReviewFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  content: string;
};

export type ResponseFile = {
  file_id: string;
  download_url: string;
  document_info: {
    filename: string;
    file_type: string;
    file_size: number;
    content_length: number;
    uploaded_at: string;
  };
};
