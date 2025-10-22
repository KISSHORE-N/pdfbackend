import axios from "axios";
// Set a higher timeout for file uploads
const axiosInstance = axios.create({
    timeout: 30000 // 30 seconds timeout
});

const API_URL="http://localhost:8080/api/files";

export const getFiles=async()=>{
  const res=await axiosInstance.get(API_URL);
  return res.data;
};

// Updated addFile function to correctly handle FormData objects.
// 'fileData' is expected to be a FormData object containing the MultipartFile and RequestParams.
export const addFile=async(fileData)=>{
    const res = await axiosInstance.post(
        API_URL, 
        fileData, 
        {
            // Crucially, tell axios not to set the default 'Content-Type': 'application/json' 
            // and let the browser/axios determine the correct 'multipart/form-data' boundary.
            headers: {
                'Content-Type': 'multipart/form-data' 
                // Note: Even though we specify it here, Axios will typically handle the boundary. 
                // Explicitly setting it helps ensure compatibility.
            }
        }
    );
    return res.data;
};

export const transferFile=async(id)=>{
  const res=await axiosInstance.post(`${API_URL}/transfer/${id}`);
  return res.data;
};
