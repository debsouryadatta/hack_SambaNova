'use client'

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SidebarComponent from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Upload, BookmarkPlus , ClipboardCopy} from 'lucide-react';

const GenerateCoverLetter = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const handleGenerateCoverLetter = async () => {
    try {
      setError("");
      setLoading(true);
      console.log("Starting cover letter generation...");

      // Create FormData
      const formData = new FormData();
      
      // Handle resume file
      if (resumeFile) {
        console.log("Resume file:", resumeFile.name, resumeFile.type);
        formData.append("resume_file", resumeFile);
        formData.append("resume_type", "pdf");  // Assuming PDF for now
      } else {
        throw new Error("Please upload your resume");
      }

      // Handle job description
      if (jobDescription.trim()) {
        console.log("Using text job description");
        formData.append("job_description", jobDescription);
        formData.append("job_description_type", "text");
      } else if (jobDescriptionFile) {
        console.log("Job description file:", jobDescriptionFile.name, jobDescriptionFile.type);
        formData.append("job_description_file", jobDescriptionFile);
        formData.append("job_description_type", "pdf"); // Assuming PDF for now
      } else {
        throw new Error("Please provide a job description");
      }

      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch("http://localhost:8000/api/v1/cover_letter/create", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      
      const result = await response.json();
      console.log("API response:", result);

      if (!response.ok) {
        throw new Error(result.detail || "Failed to generate cover letter");
      }

      setCoverLetter(result.data.cover_letter);
      setSuccessMessage("Cover letter generated successfully!");
      
    } catch (error) {
      console.error("Error details:", error);
      setError(error.message || "An error occurred while generating the cover letter");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback((e, setFile, fileType) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`Uploading ${fileType}:`, file.name, file.type);
      setFile(file);
      setError("");
    }
  }, []);


  const handleSaveCoverLetter = async () => {
    const userId = localStorage.getItem("user_id");
  
    if (!userId) {
      setError("Please log in to save your cover letter.");
      return;
    }
  
    if (!coverLetter) {
      setError("No cover letter to save.");
      return;
    }
  
    setSaveLoading(true);
    setError("");
  
    try {
      const response = await fetch(`http://localhost:8000/api/v1/cover_letter/save/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cover_letter: coverLetter,
          resume_text: resumeFile ? resumeFile.name : "Resume from file",
          job_description: jobDescription || "Job description from file",
        }),
      });
  
      const result = await response.json();
      console.log("Save response:", result);
  
      if (!response.ok) {
        throw new Error(result.detail || "Failed to save cover letter");
      }
  
      setSuccessMessage("Cover letter saved successfully!");
    } catch (error) {
      setError(`Error saving cover letter: ${error.message}`);
      console.error("Save error:", error);
    } finally {
      setSaveLoading(false);
    }
  };


  // Function to copy the cover letter
  const handleCopyCoverLetter = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter)
        .then(() => {
          setSuccessMessage("Cover letter copied to clipboard!");
        })
        .catch(() => {
          setError("Failed to copy cover letter.");
        });
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <SidebarComponent />
      <div className="flex-1 p-4 lg:p-8 bg-gray-100 dark:bg-neutral-800 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="w-full max-w-4xl mx-auto dark:backdrop-blur-xl dark:bg-black/10 border dark:border-white/10">
            <CardContent className="p-4 lg:p-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-center mb-6">
                Generate Your Cover Letter
              </h1>

              {error && (
                <Alert className="mb-4 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="mb-4 bg-green-50">
                  <AlertDescription className="text-green-700">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid grid-cols-2 gap-2 lg:gap-0 mb-6">
                  <TabsTrigger value="text">Job Description Text</TabsTrigger>
                  <TabsTrigger value="file">Job Description File</TabsTrigger>
                </TabsList>

                <TabsContent value="text">
                  <Input
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full mb-6"
                  />

<div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 mb-6">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setResumeFile, 'resume')}
                  className="hidden"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-indigo-600 hover:text-indigo-500">
                    Upload Resume
                  </span>
                  <p className="mt-2 text-sm text-gray-500">
                    {resumeFile ? `Selected: ${resumeFile.name}` : "PDF, DOC, or DOCX files only"}
                  </p>
                </label>
              </div>

                </TabsContent>

                <TabsContent value="file">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 mb-6">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, setJobDescriptionFile, 'job description')}
                      className="hidden"
                      id="job-desc-upload"
                      accept=".pdf,.doc,.docx"
                    />
                    <label htmlFor="job-desc-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <span className="text-indigo-600 hover:text-indigo-500">
                        Upload Job Description File
                      </span>
                      <p className="mt-2 text-sm text-gray-500">
                        {jobDescriptionFile ? `Selected: ${jobDescriptionFile.name}` : "PDF, DOC, or DOCX files only"}
                      </p>
                    </label>
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-indigo-500 mb-6">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, setResumeFile, 'resume')}
                  className="hidden"
                  id="resume-upload"
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-indigo-600 hover:text-indigo-500">
                    Upload Resume
                  </span>
                  <p className="mt-2 text-sm text-gray-500">
                    {resumeFile ? `Selected: ${resumeFile.name}` : "PDF, DOC, or DOCX files only"}
                  </p>
                </label>
              </div>

                </TabsContent>
              </Tabs>

              
              <Button
                onClick={handleGenerateCoverLetter}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Cover Letter"}
              </Button>

             
              {coverLetter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  // className="mt-6 p-6 bg-white rounded-lg shadow-md border"
                >
                  <h3 className="font-semibold mb-4">Generated Cover Letter:</h3>
                  <pre className="whitespace-pre-wrap text-gray-700 w-full">{coverLetter}</pre>
                  <Button
                    onClick={handleSaveCoverLetter}
                    className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white"
                    disabled={saveLoading}
                  >
                    <BookmarkPlus className="w-6 h-6 mr-2" />
                    {saveLoading ? "Saving..." : "Save Cover Letter"}
                  </Button>

                  <Button
                      onClick={handleCopyCoverLetter}
                      className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      <ClipboardCopy className="w-6 h-6 mr-2" />
                      Copy Cover Letter
                    </Button>
                 </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenerateCoverLetter;