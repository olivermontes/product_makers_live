'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

import { User, Role } from '@prisma/client'
import { updateProfile } from '@/app/dashboard/profile/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface ProfileFormProps {
  initialData: User
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { data: session, update } = useSession()

  // Form state
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ message: string, type: 'success' | 'error' | null }>({
    message: '',
    type: null
  })

  // Cast initialData to include the profile fields we know exist
  const typedInitialData = initialData as User & {
    bio: string | null
    twitter: string | null
    github: string | null
    linkedin: string | null
    website: string | null
  }

  const [formData, setFormData] = useState({
    name: typedInitialData.name || '',
    bio: typedInitialData.bio || '',
    role: (typedInitialData.role || '') as Role | '',
    twitter: typedInitialData.twitter || '',
    github: typedInitialData.github || '',
    linkedin: typedInitialData.linkedin || '',
    website: typedInitialData.website || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as Role | '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ message: '', type: null })

    try {
      const result = await updateProfile(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...result.user
        }
      })

      setStatus({ message: 'Profile updated successfully', type: 'success' })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setStatus({ message: error.message || 'Failed to update profile', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your maker profile information
        </p>
      </div>

      {status.type && (
        <div className={`p-4 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-300' :
          'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300'
          }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and how you appear on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="text-xl">
                      {session?.user?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-muted-foreground">
                    Avatar from Discord
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={handleRoleChange}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                        <SelectItem value="ProductManager">Product Manager</SelectItem>
                        <SelectItem value="Marketer">Marketer</SelectItem>
                        <SelectItem value="Founder">Founder</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>
                Add your social media links to connect with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="Your Twitter username"
                />
                <p className="text-xs text-muted-foreground">
                  Just the username without the @ symbol
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="Your GitHub username"
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="Your LinkedIn username"
                />
                <p className="text-xs text-muted-foreground">
                  For example, "johndoe" from linkedin.com/in/johndoe
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
} 