import * as React from "react";
import { Accept, FileRejection, useDropzone } from "react-dropzone";
import {
  Controller,
  get,
  RegisterOptions,
  useFormContext,
} from "react-hook-form";
import { HiOutlineArrowUpCircle } from "react-icons/hi2";

import ErrorMessage from "@/components/form/ErrorMessage";
import HelperText from "@/components/form/HelperText";
import Typography from "@/components/Typography";
import clsxm from "@/lib/clsxm";
import { FileWithPreview } from "@/types/form/dropzone";
import ImagePreviewCard from "@/components/form/ImagePreviewCard";

export type DropzoneInputProps = {
  id: string;
  label?: string;
  helperText?: string;
  hideError?: boolean;
  validation?: RegisterOptions;
  accept?: Accept;
  maxFiles?: number;
  disabled?: boolean;
  maxSize?: number;
  className?: string;
};

export default function UploadImage({
  id,
  label,
  helperText,
  hideError = false,
  validation,
  accept = { "image/*": [".jpg", ".jpeg", ".png"] },
  maxFiles = 1,
  maxSize = 1000000,
  className,
  disabled = false,
}: DropzoneInputProps) {
  const {
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const error = get(errors, id);

  const dropzoneRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    error && dropzoneRef.current?.focus();
  }, [error]);

  const [files, setFiles] = React.useState<FileWithPreview[]>(
    getValues(id) || [],
  );

  const onDrop = React.useCallback(
    <T extends File>(acceptedFiles: T[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        setValue(id, files ?? [...files]);
        setError(id, {
          type: "manual",
          message:
            rejectedFiles &&
            `${
              rejectedFiles[0].errors[0].code === "file-too-large"
                ? `File tidak boleh lebih dari ${maxSize / 1000000} MB`
                : rejectedFiles[0].errors[0].code === "file-invalid-type"
                  ? "Tipe file tidak didukung"
                  : rejectedFiles[0].errors[0].message
            }`,
        });
      } else {
        const acceptedFilesPreview = acceptedFiles.map((file: T) =>
          Object.assign(file, { preview: URL.createObjectURL(file) }),
        );

        setValue(
          id,
          files
            ? [...files, ...acceptedFilesPreview].slice(0, maxFiles)
            : acceptedFilesPreview,
        );

        setFiles(
          files
            ? [...files, ...acceptedFilesPreview].slice(0, maxFiles)
            : acceptedFilesPreview,
        );

        clearErrors(id);
      }
    },
    [clearErrors, files, id, maxFiles, maxSize, setError, setValue],
  );

  React.useEffect(() => {
    return () => {
      () => {
        files.forEach((file) => URL.revokeObjectURL(file.preview));
      };
    };
  }, [files]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: maxSize,
  });

  return (
    <div className="w-full space-y-1.5 rounded-md">
      {label && (
        <label htmlFor={id} className="flex space-x-1">
          <Typography weight="bold" className="text-sm text-black">
            {label}
          </Typography>
          {validation?.required && (
            <Typography className="font-bold text-danger-main">*</Typography>
          )}
        </label>
      )}

      {files?.length < maxFiles && (
        <Controller
          control={control}
          name={id}
          rules={validation}
          disabled={disabled}
          render={() => (
            <div
              ref={dropzoneRef}
              className="group focus:outline-none"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <div
                className={clsxm(
                  "w-full cursor-pointer rounded-md bg-typo-white",
                  "flex flex-col items-center space-y-[6px] p-9",
                  "border-2 border-dashed border-typo-secondary",
                  error
                    ? "border-danger-main hover:border-danger-hover group-focus:border-danger-active"
                    : "group-hover:border-typo-main group-focus:border-typo-main",
                  disabled && "cursor-not-allowed opacity-50",
                  className,
                )}
              >
                <div className="flex flex-row items-center gap-[6px]">
                  <Typography className="text-center text-xl text-black">
                    <HiOutlineArrowUpCircle />
                  </Typography>
                  <Typography className="text-center text-black">
                    Drag and drop file
                  </Typography>
                </div>
                <Typography className="text-center text-black">Or</Typography>
                <div className="rounded-xl border px-4 py-3">
                  <Typography className="text-center font-semibold text-black">
                    Upload dari Komputer
                  </Typography>
                </div>
                <Typography className="text-center text-black">
                  File berupa {accept["image/*"].join(", ")} dan tidak boleh
                  lebih dari {maxSize / 1000000} MB
                </Typography>
              </div>
            </div>
          )}
        />
      )}

      {files.length > 0 &&
        files.map((file, index) => (
          <ImagePreviewCard
            key={index}
            imgPath={file.preview}
            label={file.name}
          />
        ))}

      {!hideError && error && <ErrorMessage>{error.message}</ErrorMessage>}
      {!error && helperText && <HelperText>{helperText}</HelperText>}
    </div>
  );
}
