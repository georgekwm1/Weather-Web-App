import { useEffect, useState } from "react";
import { refreshAccessToken } from "../functions/refreshAccessToken";
import { Link, useNavigate } from "react-router-dom";



async function ChatHistory(url, navigate) {
    const checkAccessToken = async () => {
        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            const { access } = await refreshAccessToken();
            accessToken = access;
            if (!accessToken) {
                console.log("No session found. Login first");
                navigate("/signin");
                return null;
            }
        }
        return accessToken;
    };

    try {
        const accessToken = await checkAccessToken();
        if (!accessToken) return null;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            throw new Error("Error fetching chat history");
        }
        const data = await response.json();
        console.log(data); // Debugging: log fetched data
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}


async function next(navigate) {
    let data = await ChatHistory(navigate);
    const url = data.next;
    if (url) {
        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        if (response.ok) {
            data = await response.json();
            console.log(data);
            return data;
        } else {
            console.log("Error:", response.statusText);
        }
    }
    console.log("No more data");
    return null;
}

async function previous(navigate) {
    let data = await ChatHistory(navigate);
    const url = data.previous;
    if (url) {
        const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
        if (response.ok) {
            data = await response.json();
            console.log(data);
            return data;
        } else {
            console.log("Error:", response.statusText);
        }
    }
    console.log("No more data");
    return null;
}
async function deleteHistory(navigate, query_id) {
    const url = `http://localhost:8000/delete_location/${query_id}`;
    const response = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    });
    if (response.ok) {
        console.log("History deleted successfully");
        alert("History deleted successfully");
        navigate("/dashboard/weatherhistory");
    } else {
        console.log("Error:", response.statusText);
    }
}

export default function ChatHistoryPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null); // Initialize with null
    const [url, setUrl] = useState("http://localhost:8000/history"); // Default URL

    useEffect(() => {
        const fetchData = async () => {
            const chatData = await ChatHistory(url, navigate);
            setData(chatData);
        };
        fetchData();
    }, [url, navigate]);

    const handleNext = () => {
        if (data && data.next) {
            setUrl(data.next); // Update the URL to fetch the next page
        }
    };

    const handlePrevious = () => {
        if (data && data.previous) {
            setUrl(data.previous); // Update the URL to fetch the previous page
        }
    };
    const handleDelete = async (query_id) => {
        await deleteHistory(navigate, query_id);
    };

    return (
        <div className="min-h-screen bg-gray-600 flex flex-col items-center py-8">
            <h1 className="text-3xl font-bold mb-6">Chat History</h1>
            <div className="w-full max-w-4xl bg-gray-600 shadow-md rounded-lg p-6">
                {data && data.results ? (
                    data.results.map((msg, index) => (
                        <div key={index} className="border-b border-gray-300 py-4">
                            <p className="text-lg font-semibold">Longitude:</p>
                            <p className="text-gray-700 mb-2">{msg.longitude}</p>
                            <p className="text-lg font-semibold">Latitude:</p>
                            <p className="text-gray-700 mb-2">{msg.latitude}</p>
                            <p className="text-lg font-semibold">Zip Code:</p>
                            <p className="text-gray-700 mb-2">{msg.zip_code}</p>
                            <p className="text-lg font-semibold">Country Code:</p>
                            <p className="text-gray-700 mb-2">{msg.country_code}</p>
                            <p className="text-lg font-semibold">State Code:</p>
                            <p className="text-gray-700 mb-2">{msg.state_code}</p>
                            <p className="text-lg font-semibold">Response:</p>
                            <p className="text-gray-700 mb-2">{msg.response}</p>
                            <p className="text-sm text-gray-500">Created_at: {msg.created_at}</p>
                            <p className="text-sm text-gray-500">Updated_at: {msg.updated_at}</p>
                            <div className="flex">
                            <button className="mb-2" type="submit">
                                        <Link to={`/dashboard/weatherhistory/update/${msg.query_id}`} className="text-white font-bold no-underline hover:underline">
                                            Update Weather
                                        </Link>
                            </button>
                            <button onClick={() => handleDelete(msg.query_id)} className="mb-2" type="submit">Delete History</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">Loading chat history...</p>
                )}
            </div>
            <div className="flex mt-6 space-x-4">
                <button
                    onClick={handlePrevious}
                    disabled={!data || !data.previous}
                    className={`px-4 py-2 rounded-lg ${
                        !data || !data.previous
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={!data || !data.next}
                    className={`px-4 py-2 rounded-lg ${
                        !data || !data.next
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
}