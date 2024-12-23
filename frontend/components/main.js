"use client";

import { useEffect, useState } from "react";

export default function Main() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchFiles() {
      const response = await fetch("http://127.0.0.1:8000/", {
        method: "GET",
      });

      if (!response.ok) {
        setError("Failed to fetch files from db");
      }

      const files = await response.json();
      setFiles(files);
    }

    fetchFiles();
  }, []);

  const handleFileUpload = async () => {
    if (!file) {
      setError("No file to upload");
    }

    const fileData = new FormData();
    fileData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/", {
      method: "POST",
      body: fileData,
    });

    if (!response.ok) {
      setError("Failed to upload the file to db");
    }

    const newFile = await response.json();
    setFiles([...files, newFile]);
    setFile(null);
  };

  const handleFileDelete = async (fileId) => {
    const response = await fetch(`http://127.0.0.1:8000/delete/${fileId}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete the file from db");
    }

    setFiles(files.filter((file) => file.id !== fileId));
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
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
              <h1 className="w-10 h-10 mb-3 text-gray-500">Upload</h1>
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
            <p className="text-sm text-gray-600">Selected file: {file.name}</p>
            <p className="text-xs text-gray-500">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              onClick={handleFileUpload}
              className="mt-1 px-2 py-1 bg-blue-400 text-white rounded mt-5"
            >
              Upload
            </button>
          </div>
        )}
        <div className="mt-4">
          {files.map((file, index) => (
            <div key={index} className="mb-2 text-center">
              <p className="text-sm text-gray-500">
                Text from {file.file.split("/").pop()}: {file.text}
              </p>
              <button
                onClick={() => handleFileDelete(file.id)}
                className="mt-1 px-2 py-1 bg-red-400 text-white rounded mt-5"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
