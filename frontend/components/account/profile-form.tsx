"use client";

import { FC, useState } from "react";
import { PhotoUpload } from "./photo-upload";
import { FormGroup } from "./form-group";

export const ProfileForm: FC = () => {
  const [formData, setFormData] = useState({
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    bio: "Working on improving my mental health through mindfulness and regular therapy sessions."
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile</h2>
        
        <PhotoUpload name={formData.fullName} />
      </div>

      <div className="flex flex-col gap-4">
        <FormGroup
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
        <FormGroup
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <FormGroup
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <FormGroup
          label="Bio"
          isTextArea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
      </div>

      <div className="mt-6">
        <button className="bg-green-600 text-white font-medium rounded-md px-4 py-2 hover:bg-green-700 transition-colors w-fit">
          Save Changes
        </button>
      </div>
    </div>
  );
};
