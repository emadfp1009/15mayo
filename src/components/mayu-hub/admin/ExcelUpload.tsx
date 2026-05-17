import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Upload, FileSpreadsheet, Check } from 'lucide-react'

export function ExcelUpload() {
  const [uploaded, setUploaded] = useState(false)
  const [fileName, setFileName] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    // In real app, parse Excel and add to stores
    setTimeout(() => setUploaded(true), 1000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5" />
        رفع بيانات Excel
      </h3>
      <p className="text-xs text-muted-foreground">
        ارفع ملف Excel فيه بيانات المتاجر — الأعمدة المطلوبة: الاسم، الهاتف، المجاورة، الفئة، العنوان
      </p>

      {/* Template download */}
      <Card className="p-4 space-y-3">
        <h4 className="text-sm font-medium">📋 القالب المطلوب</h4>
        <div className="bg-secondary rounded-lg p-3 text-xs space-y-1 font-mono" dir="ltr">
          <p>| name_ar | phone | neighborhood | category | address |</p>
          <p>| صيدلية الشفاء | 01012345678 | 1 | pharmacy | شارع... |</p>
          <p>| سوبر ماركت | 01098765432 | 2 | supermarket | شارع... |</p>
        </div>
      </Card>

      {/* Upload area */}
      <Card className="p-6">
        <label className="flex flex-col items-center gap-3 cursor-pointer">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          {uploaded ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-green-600">تم رفع الملف بنجاح!</p>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-sm font-medium">اضغط لرفع ملف Excel</p>
              <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv</p>
              {fileName && <p className="text-xs text-primary">{fileName}</p>}
            </>
          )}
        </label>
      </Card>

      {uploaded && (
        <button
          onClick={() => { setUploaded(false); setFileName('') }}
          className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-2"
        >
          رفع ملف آخر
        </button>
      )}
    </div>
  )
}
