'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { staffService } from '@/services/staff';
import { leaveService, LeaveRequest, CreateLeaveRequest } from '@/services/leave';
import { StaffMember } from '@/services/staff';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest?: LeaveRequest;
  onSave: (data: LeaveRequest) => void;
}

export function LeaveRequestModal({
  isOpen,
  onClose,
  leaveRequest,
  onSave,
}: LeaveRequestModalProps) {
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    staff_id: 0,
    leave_type: 'non_urgent',
    start_date: '',
    end_date: '',
  });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      if (leaveRequest) {
        setFormData({
          staff_id: leaveRequest.staff_id,
          leave_type: leaveRequest.leave_type,
          start_date: leaveRequest.start_date,
          end_date: leaveRequest.end_date,
        });
      } else {
        setFormData({
          staff_id: 0,
          leave_type: 'non_urgent',
          start_date: '',
          end_date: '',
        });
      }
    }
  }, [isOpen, leaveRequest]);

  const fetchStaff = async () => {
    try {
      const staffMembers = await staffService.getStaffMembers();
      setStaff(staffMembers);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load staff members",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let response: LeaveRequest;
      if (leaveRequest) {
        response = await leaveService.updateLeaveRequest(leaveRequest.id, formData);
      } else {
        response = await leaveService.createLeaveRequest(formData);
      }
      onSave(response);
      onClose();
      toast({
        title: "Success",
        description: `Leave request ${leaveRequest ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving leave request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save leave request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'staff_id' ? parseInt(value) : value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{leaveRequest ? 'Edit Leave Request' : 'New Leave Request'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="staff_id">Staff Member</Label>
            <Select
              value={formData.staff_id.toString()}
              onValueChange={(value) => handleSelectChange('staff_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name} - {member.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave_type">Leave Type</Label>
            <Select
              value={formData.leave_type}
              onValueChange={(value) => handleSelectChange('leave_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forecast">Forecast</SelectItem>
                <SelectItem value="non_urgent">Non-Urgent</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                min={formData.start_date}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 