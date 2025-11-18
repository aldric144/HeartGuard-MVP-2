import { useState } from 'react'
import { Lock, Trash2, Download, ArrowLeft, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'https://heartguard-backend.onrender.com'

export function PrivacyControls() {
  const navigate = useNavigate()
  const [retentionDays, setRetentionDays] = useState('30')
  const [retentionResult, setRetentionResult] = useState<any>(null)
  const [deleteResult, setDeleteResult] = useState<any>(null)
  const [exportResult, setExportResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSetRetention = async () => {
    setLoading(true)
    setRetentionResult(null)
    
    try {
      const formData = new FormData()
      formData.append('user_id', '1') // TODO: Get from auth context
      formData.append('retention_days', retentionDays)
      
      const response = await fetch(`${API_URL}/api/privacy/retention`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setRetentionResult(data)
    } catch (error) {
      setRetentionResult({ success: false, error: 'Failed to set retention policy' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOldData = async () => {
    if (!confirm('Are you sure you want to delete old data based on your retention policy?')) {
      return
    }
    
    setLoading(true)
    setDeleteResult(null)
    
    try {
      const formData = new FormData()
      formData.append('user_id', '1') // TODO: Get from auth context
      formData.append('retention_days', retentionDays)
      
      const response = await fetch(`${API_URL}/api/privacy/delete-old`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setDeleteResult(data)
    } catch (error) {
      setDeleteResult({ success: false, error: 'Failed to delete old data' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllData = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL your HeartGuard data. This action cannot be undone. Are you absolutely sure?')) {
      return
    }
    
    setLoading(true)
    setDeleteResult(null)
    
    try {
      const formData = new FormData()
      formData.append('user_id', '1') // TODO: Get from auth context
      
      const response = await fetch(`${API_URL}/api/privacy/delete-all`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      setDeleteResult(data)
    } catch (error) {
      setDeleteResult({ success: false, error: 'Failed to delete all data' })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    setExportResult(null)
    
    try {
      const response = await fetch(`${API_URL}/api/privacy/export?user_id=1`) // TODO: Get from auth context
      const data = await response.json()
      
      if (data.success) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `heartguard-data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        setExportResult({ success: true, message: 'Data exported successfully' })
      } else {
        setExportResult(data)
      }
    } catch (error) {
      setExportResult({ success: false, error: 'Failed to export data' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5E8DC] via-[#E6B7BE]/30 to-[#3C4B7C]/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/app/more')}
          className="mb-4 text-[#5B3256]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Advanced Features
        </Button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-purple-50">
              <Lock className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#5B3256]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Privacy Controls
            </h1>
          </div>
          <p className="text-[#5B3256]/70">
            GDPR-compliant data management and retention
          </p>
        </div>

        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Your Privacy Rights</p>
                <p>HeartGuard is GDPR-compliant. You have the right to access, export, and delete your personal data at any time.</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Data Retention Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policy</CardTitle>
              <CardDescription>
                Set how long your data should be kept before automatic deletion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#5B3256] mb-2 block">
                  Retention Period
                </label>
                <Select value={retentionDays} onValueChange={setRetentionDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Keep Forever</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="30">30 Days (Recommended)</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#5B3256]/60 mt-2">
                  Data older than this period will be automatically deleted
                </p>
              </div>

              <Button
                onClick={handleSetRetention}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Retention Policy'}
              </Button>

              {retentionResult && (
                <Alert className={retentionResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription>
                    {retentionResult.success ? (
                      <p className="text-green-600 font-semibold">
                        ✓ Retention policy updated to {retentionResult.retention_days === 0 ? 'keep forever' : `${retentionResult.retention_days} days`}
                      </p>
                    ) : (
                      <p className="text-red-600">{retentionResult.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Delete Old Data */}
          <Card>
            <CardHeader>
              <CardTitle>Delete Old Data</CardTitle>
              <CardDescription>
                Manually delete data older than your retention period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-sm text-yellow-800">
                  This will delete all reports and conversations older than your current retention period ({retentionDays === '0' ? 'none' : `${retentionDays} days`})
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleDeleteOldData}
                disabled={loading || retentionDays === '0'}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? 'Deleting...' : 'Delete Old Data'}
              </Button>

              {deleteResult && (
                <Alert className={deleteResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription>
                    {deleteResult.success ? (
                      <p className="text-green-600 font-semibold">
                        ✓ Deleted {deleteResult.deleted_count || deleteResult.deleted_reports || 0} old records
                      </p>
                    ) : (
                      <p className="text-red-600">{deleteResult.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>
                Download all your HeartGuard data in JSON format (GDPR Right to Data Portability)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-sm text-blue-800">
                  Your data will be downloaded as a JSON file containing all your reports, conversations, and settings
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleExportData}
                disabled={loading}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Exporting...' : 'Export My Data'}
              </Button>

              {exportResult && (
                <Alert className={exportResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <AlertDescription>
                    {exportResult.success ? (
                      <p className="text-green-600 font-semibold">
                        ✓ {exportResult.message}
                      </p>
                    ) : (
                      <p className="text-red-600">{exportResult.error}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Delete All Data */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete all your HeartGuard data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-sm text-red-800">
                  <p className="font-semibold mb-1">⚠️ Warning: This action cannot be undone!</p>
                  <p>This will permanently delete ALL your reports, conversations, settings, and personal data from HeartGuard.</p>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleDeleteAllData}
                disabled={loading}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? 'Deleting...' : 'Delete All My Data'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
