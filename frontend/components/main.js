"use client";

import { useEffect, useState } from "react";

export default function FileUploadSplitView() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(() => {
    async function fetchFiles() {
      const response = await fetch("http://127.0.0.1:8000/", {
        method: "GET",
      });

      if (!response.ok) {
        setError("Failed to fetch files from db");
        return;
      }

      const files = await response.json();
      setFiles(files);
      if (files.length > 0) {
        setIsUploaded(true);
      }
    }

    fetchFiles();
  }, []);

  const handleFileUpload = async () => {
    if (!file) {
      setError("No file to upload");
      return;
    }

    const fileData = new FormData();
    fileData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/", {
      method: "POST",
      body: fileData,
    });

    if (!response.ok) {
      setError("Failed to upload the file to db");
      return;
    }

    const newFile = await response.json();
    setFiles([...files, newFile]);
    setFile(null);
    setIsUploaded(true);
  };

  const handleFileDelete = async (fileId) => {
    const response = await fetch(`http://127.0.0.1:8000/delete/${fileId}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete the file from db");
      return;
    }

    const updatedFiles = files.filter((file) => file.id !== fileId);
    setFiles(updatedFiles);
    if (updatedFiles.length === 0) {
      setIsUploaded(false);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  if (error) {
    return <p className="text-red-500 text-center p-4">{error}</p>;
  }

  return (
    <div className="flex h-screen bg-gray-100 items-center justify-center">
      {!isUploaded ? (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-500">
            File Upload
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Upload your files here. We accept only PNG, JPG files up to 10 MB.
          </p>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-10 h-10 mb-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  {file ? file.name : "No file selected"}
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          {file && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Selected file: {file.name}
              </p>
              <p className="text-xs text-gray-500">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={handleFileUpload}
                className="mt-5 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Upload
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full p-8">
          <div className="h-full bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-2xl font-bold p-4 text-center text-gray-500 bg-gray-100">
              Uploaded Files
            </h2>
            {files.length === 0 ? (
              <p className="text-gray-500 text-center p-4">
                No files uploaded yet.
              </p>
            ) : (
              <div className="flex h-[calc(100%-4rem)]">
                <div className="w-1/2 p-4 border-r border-gray-200 overflow-y-auto">
                  <h3 className="text-2xl font-bold mb-4 text-center text-gray-500">
                    Original File
                  </h3>
                  {files.map((file, index) => (
                    <div key={index} className="mb-4 p-4">
                      <div className="relative w-full h-48 bg-gray-200 rounded overflow-hidden">
                        {/* <Image
                          src={`http://127.0.0.1:8000${file.file}`}
                          alt={`Uploaded file ${index + 1}`}
                          layout="fill"
                          objectFit="contain"
                        /> */}
                      </div>
                      <button
                        onClick={() => handleFileDelete(file.id)}
                        className="mt-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                <div className="w-1/2 p-4 overflow-y-auto">
                  <h3 className="text-2xl font-bold mb-4 text-center text-gray-500">
                    Extracted Text
                  </h3>
                  {files.map((file, index) => (
                    <div key={index} className="mb-4 p-4">
                      <p className="text-sm text-gray-600">{file.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
