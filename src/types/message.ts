export type UploadedFile = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
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
