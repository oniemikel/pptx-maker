export type DialogItem = {
  title: string;
  content: string;
};

export type DepartmentsDoc = {
  ds: string;
  de: string;
  biz: string;
  cc: string;
  info_contents: DialogItem[];
};

export type UserDoc = {
  role?: string;
};

export type GenerateResponse = {
  file: string;
  filename: string;
};
