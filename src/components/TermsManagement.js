// src/components/TermsManagement.js
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Globe,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Languages,
  BookOpen,
  Shield,
  CreditCard,
  Users,
  X,
  Save,
  Type,
  Code,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { termsAPI } from "../services/api";
import { formatDate, formatDate2 } from "../utils/dateUtils";
import { parseValidationErrors } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatNumber } from "../utils/formatUtils";
import ConfirmationModal from "./common/ConfirmationModal";

// Terms Editor Modal
const TermsEditorModal = ({
  terms,
  isOpen,
  onClose,
  onSave,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    type: "USER_TERMS",
    language: "en",
    title: "",
    content: "",
    version: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { showSuccess, showError } = useToast();
  const [previewMode, setPreviewMode] = useState(false);

  const termsTypes = [
    { value: "USER_TERMS", label: "User Terms & Conditions", icon: Users },
    {
      value: "PROVIDER_TERMS",
      label: "Service Provider Terms & Conditions",
      icon: Shield,
    },
    { value: "PRIVACY_POLICY", label: "Privacy Policy", icon: BookOpen },
    { value: "PAYMENT_TERMS", label: "Payment Terms", icon: CreditCard },
  ];

  const languages = [
    { value: "en", label: "English" },
    { value: "vi", label: "Tiếng Việt" },
  ];

  useEffect(() => {
    if (terms && isEditing) {
      setFormData({
        type: terms.type || "USER_TERMS",
        language: terms.language || "en",
        title: terms.title || "",
        content: terms.content || "",
        version: terms.version || "",
        active: terms.active !== undefined ? terms.active : true,
      });
    } else {
      setFormData({
        type: "USER_TERMS",
        language: "en",
        title: "",
        content: "",
        version: "",
        active: true,
      });
    }
    setValidationErrors({});
  }, [terms, isEditing, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setValidationErrors({});

    try {
      let response;
      if (isEditing) {
        response = await termsAPI.updateTerms(terms.id, formData);
      } else {
        response = await termsAPI.createTerms(formData);
      }

      showSuccess(`Terms ${isEditing ? "updated" : "created"} successfully!`);
      onSave(response.data);
      onClose();
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      if (parsedError.type === "validation") {
        setValidationErrors(parsedError.fieldErrors);
        showError("Please fix the validation errors");
      } else {
        showError(parsedError.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const insertMarkdownSample = () => {
    const sampleMarkdown = `# Title Here

## Section 1

This is a **bold** text and this is *italic* text.

### Subsection 1.1

- Bullet point 1
- Bullet point 2
- Bullet point 3

### Subsection 1.2

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

## Section 2

> This is a blockquote
> with multiple lines

Here is a \`code snippet\` in the middle of a sentence.

\`\`\`
// This is a code block
function example() {
  return "Hello World";
}
\`\`\`

---

**Footer text here**
`;
    setFormData((prev) => ({ ...prev, content: sampleMarkdown }));
  };

  // Custom Markdown components for preview
  const markdownComponents = {
    h1: ({ children }) => (
      <h1 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300 text-left">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-4 text-left">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-md font-semibold text-gray-700 mb-2 mt-3 text-left">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-medium text-gray-700 mb-1 mt-2 text-left">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="text-gray-600 leading-relaxed mb-3 text-sm text-left">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-800">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
    ul: ({ children }) => (
      <ul className="list-disc ml-4 text-gray-600 mb-3 space-y-1 text-sm">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal ml-4 text-gray-600 mb-3 space-y-1 text-sm">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="text-left">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-3 py-2 my-3 bg-blue-50 italic text-gray-700 text-sm rounded-r">
        <div className="text-left">{children}</div>
      </blockquote>
    ),
    code: ({ inline, children }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-3">
          <code className="text-xs font-mono text-gray-800 block text-left whitespace-pre">
            {children}
          </code>
        </pre>
      );
    },
    hr: () => <hr className="my-4 border-t border-gray-200" />,
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  if (!isOpen) return null;

  const selectedType = termsTypes.find((t) => t.value === formData.type);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+CjwvZz4KPC9zdmc+')] opacity-30"></div>

          <div className="relative px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                {selectedType && (
                  <selectedType.icon className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? "Edit Terms" : "Create New Terms"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEditing
                    ? "Update existing terms and conditions"
                    : "Create new legal document"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-2xl transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Form Fields */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Terms Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                    validationErrors.type ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                >
                  {termsTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {validationErrors.type && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {validationErrors.type}
                  </p>
                )}
              </div>

              {/* Language */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                    validationErrors.language
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  required
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                {validationErrors.language && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {validationErrors.language}
                  </p>
                )}
              </div>

              {/* Version (only for editing) */}
              {isEditing && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) =>
                      handleInputChange("version", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="e.g., 1.0, 2.1"
                  />
                </div>
              )}

              {/* Active Status (only for editing) */}
              {isEditing && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === true}
                        onChange={() => handleInputChange("active", true)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === false}
                        onChange={() => handleInputChange("active", false)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-red-700 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="mt-6 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${
                  validationErrors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter title..."
                required
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {validationErrors.title}
                </p>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Section */}
            <div className="flex-1 flex flex-col border-r border-gray-200">
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <label className="text-lg font-semibold text-gray-800">
                      Content Editor
                    </label>
                    <p className="text-sm text-gray-600">Markdown supported</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={insertMarkdownSample}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Insert Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-4 py-2 text-sm rounded-xl flex items-center gap-2 transition-colors duration-200 ${
                      previewMode
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    {previewMode ? "Hide Preview" : "Show Preview"}
                  </button>
                </div>
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  className={`w-full h-full p-6 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm bg-white/80 backdrop-blur-sm transition-all duration-300 ${
                    validationErrors.content ? "border-red-500" : ""
                  }`}
                  placeholder="# Terms Title

## Section 1
Your content here...

### Subsection
- List item 1
- List item 2

**Bold text** and *italic text*

> Blockquote here

\`inline code\` and:

\`\`\`
code block
\`\`\`"
                  required
                />
                {validationErrors.content && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-50 border-t border-red-200">
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {validationErrors.content}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {previewMode && (
              <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-sm">
                <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Live Preview
                      </h3>
                      <p className="text-sm text-gray-600">
                        Real-time markdown rendering
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {formData.content || "*No content to preview*"}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <Save className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm text-gray-600">
                  {isEditing ? "Update existing terms" : "Create new terms"}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {saving ? (
                    <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
                  ) : (
                    <Save className="w-5 h-5 relative z-10" />
                  )}
                  <span className="relative z-10 font-medium">
                    {isEditing ? "Update" : "Create"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Terms Preview Modal
const TermsPreviewModal = ({ terms, isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState("rendered");
  if (!isOpen || !terms) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case "USER_TERMS":
        return <Users className="w-5 h-5" />;
      case "PROVIDER_TERMS":
        return <Shield className="w-5 h-5" />;
      case "PRIVACY_POLICY":
        return <BookOpen className="w-5 h-5" />;
      case "PAYMENT_TERMS":
        return <CreditCard className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "USER_TERMS":
        return "User Terms & Conditions";
      case "PROVIDER_TERMS":
        return "Service Provider Terms & Conditions";
      case "PRIVACY_POLICY":
        return "Privacy Policy";
      case "PAYMENT_TERMS":
        return "Payment Terms";
      default:
        return type;
    }
  };

  // Custom Markdown components for better styling
  const markdownComponents = {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-500 text-left">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8 text-left">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6 text-left">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-medium text-gray-700 mb-2 mt-4 text-left">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p className="text-gray-600 leading-relaxed mb-4 text-left text-justify">
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-800">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
    ul: ({ children }) => (
      <ul className="list-disc ml-6 text-gray-600 mb-4 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal ml-6 text-gray-600 mb-4 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-left leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-6 py-3 my-6 bg-blue-50 italic text-gray-700 rounded-r-lg">
        <div className="text-left">{children}</div>
      </blockquote>
    ),
    code: ({ inline, children }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border">
            {children}
          </code>
        );
      }
      return (
        <div className="my-6">
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto border shadow-sm">
            <code className="text-sm font-mono block text-left whitespace-pre">
              {children}
            </code>
          </pre>
        </div>
      );
    },
    hr: () => <hr className="my-8 border-t-2 border-gray-200" />,
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-white/20">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+CjwvZz4KPC9zdmc+')] opacity-30"></div>

          <div className="relative px-8 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                {getTypeIcon(terms.type)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{terms.title}</h2>
                <p className="text-blue-100 text-sm">
                  {getTypeLabel(terms.type)} • {terms.language.toUpperCase()} •
                  v{terms.version}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-white/20 backdrop-blur-sm rounded-2xl p-1 border border-white/30">
                <button
                  onClick={() => setViewMode("rendered")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "rendered"
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Type className="w-4 h-4" />
                  Rendered
                </button>
                <button
                  onClick={() => setViewMode("markdown")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "markdown"
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Markdown
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-2xl transition-all duration-200 hover:scale-110"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "rendered" ? (
            // Rendered Markdown View with proper text alignment
            <div className="h-full overflow-y-auto">
              <div className="max-w-4xl mx-auto px-8 py-6">
                <div className="prose prose-lg prose-blue max-w-none">
                  <ReactMarkdown components={markdownComponents}>
                    {terms.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            // Raw Markdown View
            <div className="h-full overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-4xl mx-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed text-left">
                  {terms.content}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-gray-600">
                Created: {formatDate2(terms.createdAt)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-gray-600">
                Last Updated: {formatDate2(terms.updatedAt)}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="group relative px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <X className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-medium">Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsManagement = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerms, setSelectedTerms] = useState(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [filters, setFilters] = useState({
    query: "",
    type: "",
    language: "",
    active: "",
  });

  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { showSuccess, showError, showWarning } = useToast();
  const [confirmationModal, setConfirmationModal] = useState({});

  const termsTypes = [
    { value: "USER_TERMS", label: "User Terms & Conditions", icon: Users },
    {
      value: "PROVIDER_TERMS",
      label: "Service Provider Terms & Conditions",
      icon: Shield,
    },
    { value: "PRIVACY_POLICY", label: "Privacy Policy", icon: BookOpen },
    { value: "PAYMENT_TERMS", label: "Payment Terms", icon: CreditCard },
  ];

  useEffect(() => {
    loadTerms();
  }, [filters, sortBy, sortOrder]);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const response = await termsAPI.getAllTermsAllLanguages();
      let allTerms = response.data;

      // Apply filters
      if (filters.query) {
        const query = filters.query.toLowerCase();
        allTerms = allTerms.filter(
          (term) =>
            term.title.toLowerCase().includes(query) ||
            term.content.toLowerCase().includes(query)
        );
      }

      if (filters.type) {
        allTerms = allTerms.filter((term) => term.type === filters.type);
      }

      if (filters.language) {
        allTerms = allTerms.filter(
          (term) => term.language === filters.language
        );
      }

      if (filters.active !== "") {
        const isActive = filters.active === "true";
        allTerms = allTerms.filter((term) => term.active === isActive);
      }

      // Apply sorting
      allTerms.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case "title":
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case "type":
            aValue = a.type;
            bValue = b.type;
            break;
          case "language":
            aValue = a.language;
            bValue = b.language;
            break;
          case "version":
            aValue = a.version || "";
            bValue = b.version || "";
            break;
          case "createdAt":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case "updatedAt":
          default:
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
            break;
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      setTerms(allTerms);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ query: "", type: "", isRead: "" });
  };

  const hasActiveFilters = filters.query || filters.type;

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, query: e.target.value }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleCreateNew = () => {
    setSelectedTerms(null);
    setIsEditing(false);
    setIsEditorModalOpen(true);
  };

  const handleEdit = (termsItem) => {
    setSelectedTerms(termsItem);
    setIsEditing(true);
    setIsEditorModalOpen(true);
  };

  const handlePreview = (termsItem) => {
    setSelectedTerms(termsItem);
    setIsPreviewModalOpen(true);
  };

  const handleDelete = async (termsItem) => {
    setConfirmationModal({
      isOpen: true,
      type: "danger",
      title: `Delete Terms & Conditions`,
      message: `Are you sure you want to delete ${termsItem.title}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      icon: Trash2,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));

        try {
          await termsAPI.deleteTerms(termsItem.id);
          showSuccess("Terms deleted successfully!");
          loadTerms();
        } catch (error) {
          const parsedError = parseValidationErrors(error);
          showError(parsedError.message);
        }
      },
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
    });
  };

  const handleSave = (savedTerms) => {
    loadTerms();
  };

  const getTypeIcon = (type) => {
    const typeConfig = termsTypes.find((t) => t.value === type);
    return typeConfig ? (
      <typeConfig.icon className="w-5 h-5 text-gray-500" />
    ) : (
      <FileText className="w-5 h-5 text-gray-500" />
    );
  };

  const getTypeLabel = (type) => {
    const typeConfig = termsTypes.find((t) => t.value === type);
    return typeConfig ? typeConfig.label : type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPgo8L2c+Cjwvc3ZnPg==')]"></div>

        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Terms & Conditions Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage legal documents and policies
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(terms.length)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Terms & Conditions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadTerms}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RefreshCw className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Refresh</span>
              </button>

              <button
                onClick={handleCreateNew}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Create</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-8 -mt-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Filters & Search
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search Notifications
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search title, message..."
                  value={filters.query}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Types</option>
                {termsTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange("language", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={filters.active}
                onChange={(e) => handleFilterChange("active", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Directory Section */}
      <div className="px-8 mt-8 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Notification Directory
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(terms.length)} notifications total
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    onClick={() => handleSort("updatedAt")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      Last Updated
                      {sortBy === "updatedAt" && (
                        <div className="p-1 bg-blue-100 rounded">
                          {sortOrder === "asc" ? (
                            <ChevronUp className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-gray-600 font-medium">
                          Loading terms...
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : terms.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-gray-100 rounded-full">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-gray-500 text-lg">
                          No terms found
                        </div>
                        <div className="text-gray-400 text-sm">
                          Try adjusting your filters
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  terms.map((termsItem) => (
                    <tr
                      key={termsItem.id}
                      className="hover:bg-white/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-lg">
                            {getTypeIcon(termsItem.type)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {getTypeLabel(termsItem.type)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex text-sm items-start font-medium text-gray-900 max-w-xs truncate">
                          {termsItem.title
                            ? termsItem.title.length > 24
                              ? termsItem.title.substring(0, 24) + "..."
                              : termsItem.title
                            : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 uppercase">
                            {termsItem.language}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            termsItem.active
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {termsItem.active ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {termsItem.active ? "Active" : "Inactive"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {formatDate2(termsItem.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePreview(termsItem)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Preview"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(termsItem)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Terms Editor Modal */}
      <TermsEditorModal
        terms={selectedTerms}
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        onSave={handleSave}
        isEditing={isEditing}
      />

      {/* Terms Preview Modal */}
      <TermsPreviewModal
        terms={selectedTerms}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        type={confirmationModal.type}
        icon={confirmationModal.icon}
        isLoading={confirmationModal.isLoading}
      />
    </div>
  );
};

export default TermsManagement;
