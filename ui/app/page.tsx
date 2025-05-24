"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, Send, FileText, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  file?: {
    name: string
    size: number
  }
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Add your webhook URL here for PDF extraction
  const WEBHOOK_URL = "http://localhost:5678/webhook-test/daeb1792-4c5d-4555-bdb9-e433989847c7"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
    } else {
      alert("Please select a PDF file only")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  // Alternative: Function to convert file to ArrayBuffer (if you prefer raw binary data)
  const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedFile) return;
  
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim() || "Uploaded PDF for analysis",
      file: {
        name: selectedFile.name,
        size: selectedFile.size,
      },
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
  
    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (input.trim()) {
        formData.append("message", input.trim());
      }
  
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData, // No need to set Content-Type; browser sets it with correct boundary
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
  
      const responseText = await response.text();
  
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: responseText || "PDF uploaded successfully to webhook!",
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "Sorry, there was an error processing your request. Please check your webhook endpoint and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(scrollToBottom, 100);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold">PDF Extractor</h1>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to PDF Extractor</h3>
              <p className="text-gray-600">Upload a PDF file to extract its content and data</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}>
                <Card
                  className={cn(
                    "max-w-[80%] p-4",
                    message.type === "user" ? "bg-blue-600 text-white" : "bg-white border",
                  )}
                >
                  {message.file && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{message.file.name}</span>
                      <span className="text-xs opacity-75">({formatFileSize(message.file.size)})</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className={cn(
                      "text-xs mt-2 opacity-75",
                      message.type === "user" ? "text-blue-100" : "text-gray-500",
                    )}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </Card>
              </div>
            ))
          )}

          {(isLoading || isProcessing) && (
            <div className="flex justify-start">
              <Card className="bg-white border p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">
                    {isLoading ? "Uploading PDF..." : "Extracting PDF data..."}
                  </span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <div className="border-t bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload Area */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{selectedFile ? "Change PDF" : "Upload PDF"}</span>
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{selectedFile.name}</span>
                  <span className="text-xs text-blue-600">({formatFileSize(selectedFile.size)})</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add a message (optional) or just upload to extract PDF data..."
                className="flex-1"
                disabled={isLoading || isProcessing}
              />
              <Button type="submit" disabled={(isLoading || isProcessing) || !selectedFile} className="px-6">
                {(isLoading || isProcessing) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}