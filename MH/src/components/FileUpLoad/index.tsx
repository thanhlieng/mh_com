/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from 'antd';
import { ChangeEvent, useRef } from 'react';

import { transformLinkImageToObject } from '@/utils/ultils';
interface FileUploadProps {
  handleSetFileList: (data: any) => void;
  fileList: any;
  label?: string;
  isDisable?: boolean;
}
const FileUpload = ({
  handleSetFileList,
  fileList,
  label,
  isDisable,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    handleSetFileList(e.target.files);
  };
  const handleUploadClick = () => {
    inputRef.current?.click();
  };
  const files = fileList ? [...fileList] : [];

  return (
    <div>
      <input
        type='file'
        ref={inputRef}
        accept='image/png,image/jpg,application/pdf,.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
        className='hidden'
        multiple
        onChange={handleFileChange}
      />
      {!isDisable &&
        files?.map((v: any) => (
          <p className='m-o p-0' key={v}>
            <a href={v}>{transformLinkImageToObject(v)}</a>
          </p>
        ))}
      <Button onClick={handleUploadClick}>{label ? label : 'Chọn file'}</Button>
    </div>
  );
};

export default FileUpload;
