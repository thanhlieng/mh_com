/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormInstance } from 'antd';

export interface FormCategoryPostProps {
  form: FormInstance;
  handleSubmit: () => void;
  fileList: any;
  handleSetFileList: (data: any) => void;
}
