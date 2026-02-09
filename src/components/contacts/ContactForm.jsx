import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useContactStore } from '../../store/contactStore.db';
import { useGroupStore } from '../../store/groupStore';
import { Button } from '../common/Button';
import { Mail, User, Building2, Phone, Tag, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactForm = ({ contact, onClose }) => {
  const { addContact, updateContact } = useContactStore();
  const { groups, initializeGroups } = useGroupStore();
  const [tags, setTags] = useState(contact?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  useEffect(() => {
    initializeGroups();
  }, []);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: contact || {
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
      status: 'active',
      groupId: null,
      tags: []
    }
  });

  const onSubmit = async (data) => {
    try {
      const contactData = {
        ...data,
        tags,
        groupId: data.groupId ? parseInt(data.groupId) : null
      };
      
      if (contact) {
        await updateContact(contact.id, contactData);
        toast.success('Contact updated successfully');
      } else {
        await addContact(contactData);
        toast.success('Contact added successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save contact');
      console.error(error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            First Name *
          </label>
          <input
            {...register('firstName', { required: 'First name is required' })}
            className="input-field"
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            Last Name *
          </label>
          <input
            {...register('lastName', { required: 'Last name is required' })}
            className="input-field"
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Mail size={16} className="text-gray-500" />
          Email Address *
        </label>
        <input
          type="email"
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="input-field"
          placeholder="email@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Building2 size={16} className="text-gray-500" />
            Company
          </label>
          <input
            {...register('company')}
            className="input-field"
            placeholder="Company name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Phone size={16} className="text-gray-500" />
            Phone
          </label>
          <input
            {...register('phone')}
            className="input-field"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          Group
        </label>
        <select
          {...register('groupId')}
          className="input-field"
        >
          <option value="">No Group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Status
        </label>
        <select
          {...register('status')}
          className="input-field"
        >
          <option value="active">✅ Active</option>
          <option value="unsubscribed">🔕 Unsubscribed</option>
          <option value="bounced">❌ Bounced</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Tag size={16} className="text-gray-500" />
          Tags
        </label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 input-field"
            />
            <Button type="button" onClick={addTag} variant="outline" size="md">
              Add Tag
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  <Tag size={14} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-500 hover:text-blue-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" className="flex-1 btn-gradient">
          {contact ? 'Update Contact' : 'Add Contact'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="px-8">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;