'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EvacuationFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export function EvacuationForm({
  initialData,
  onSubmit,
  isAdmin = false,
  isLoading = false,
}: EvacuationFormProps) {
  const [formData, setFormData] = useState({
    patientName: initialData?.patient_name || '',
    patientAge: initialData?.patient_age || '',
    patientCondition: initialData?.patient_condition || '',
    location: initialData?.location || '',
    destination: initialData?.destination || '',
    priorityLevel: initialData?.priority_level || 'medium',
    medicalNotes: initialData?.medical_notes || '',
    contactPerson: initialData?.contact_person || '',
    contactPhone: initialData?.contact_phone || '',
    status: initialData?.status || 'pending',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.patientName || !formData.location) {
      setError('Patient name and location are required');
      return;
    }

    try {
      await onSubmit(formData);
      setSuccess(true);
      if (!initialData) {
        setFormData({
          patientName: '',
          patientAge: '',
          patientCondition: '',
          location: '',
          destination: '',
          priorityLevel: 'medium',
          medicalNotes: '',
          contactPerson: '',
          contactPhone: '',
          status: 'pending',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Evacuation Request' : 'Create New Evacuation Request'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-100">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {initialData ? 'Evacuation request updated successfully' : 'Evacuation request created successfully'}
              </AlertDescription>
            </Alert>
          )}

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="patientName" className="text-sm font-medium">
                  Patient Name *
                </label>
                <Input
                  id="patientName"
                  name="patientName"
                  placeholder="Full name"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="patientAge" className="text-sm font-medium">
                  Patient Age
                </label>
                <Input
                  id="patientAge"
                  name="patientAge"
                  type="number"
                  placeholder="Age in years"
                  value={formData.patientAge}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="patientCondition" className="text-sm font-medium">
                Medical Condition
              </label>
              <Textarea
                id="patientCondition"
                name="patientCondition"
                placeholder="Describe the patient's condition"
                value={formData.patientCondition}
                onChange={handleChange}
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Current Location *
                </label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Patient's current location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="destination" className="text-sm font-medium">
                  Destination Hospital
                </label>
                <Input
                  id="destination"
                  name="destination"
                  placeholder="Target hospital or facility"
                  value={formData.destination}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="priorityLevel" className="text-sm font-medium">
                  Priority Level
                </label>
                <Select
                  value={formData.priorityLevel}
                  onValueChange={(value) => handleSelectChange('priorityLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isAdmin && (
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="medicalNotes" className="text-sm font-medium">
                Medical Notes
              </label>
              <Textarea
                id="medicalNotes"
                name="medicalNotes"
                placeholder="Additional medical information or special requirements"
                value={formData.medicalNotes}
                onChange={handleChange}
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="contactPerson" className="text-sm font-medium">
                  Contact Person
                </label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  placeholder="Name of contact person"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contactPhone" className="text-sm font-medium">
                  Contact Phone
                </label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? 'Processing...'
              : initialData
                ? 'Update Request'
                : 'Create Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
