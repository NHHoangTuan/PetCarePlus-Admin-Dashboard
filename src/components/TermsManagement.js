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
  ChevronLeft,
  ChevronRight,
  Languages,
  BookOpen,
  Shield,
  CreditCard,
  Users,
  X,
  Save,
  Type,
  Code,
} from "lucide-react";
import { termsAPI } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { parseValidationErrors } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header - unchanged */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {selectedType && <selectedType.icon className="w-6 h-6" />}
            {isEditing ? "Edit Terms" : "Create New Terms"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Form Fields */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.type}
                  </p>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language *
                </label>
                <select
                  value={formData.language}
                  onChange={(e) =>
                    handleInputChange("language", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.language}
                  </p>
                )}
              </div>

              {/* Version (only for editing) */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) =>
                      handleInputChange("version", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 1.0, 2.1"
                  />
                </div>
              )}

              {/* Active Status (only for editing) */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === true}
                        onChange={() => handleInputChange("active", true)}
                        className="mr-2"
                      />
                      <span className="text-sm text-green-600">Active</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === false}
                        onChange={() => handleInputChange("active", false)}
                        className="mr-2"
                      />
                      <span className="text-sm text-red-600">Inactive</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter title..."
                required
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.title}
                </p>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Section */}
            <div className="flex-1 flex flex-col border-r border-gray-200">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <label className="text-sm font-medium text-gray-700">
                  Content * (Markdown Supported)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={insertMarkdownSample}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Insert Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-3 py-1 text-xs rounded flex items-center gap-1 ${
                      previewMode
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    {previewMode ? "Hide Preview" : "Show Preview"}
                  </button>
                </div>
              </div>

              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className={`flex-1 p-4 border-0 focus:ring-0 focus:outline-none resize-none font-mono text-sm ${
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

`inline code` and:

```
code block
```"
                required
              />
              {validationErrors.content && (
                <p className="p-4 text-sm text-red-600 border-t border-red-200">
                  {validationErrors.content}
                </p>
              )}
            </div>

            {/* Preview Section */}
            {previewMode && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700">
                    Live Preview
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-white">
                  <div className="max-w-none text-left">
                    <ReactMarkdown components={markdownComponents}>
                      {formData.content || "*No content to preview*"}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? "Update" : "Create"}
            </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header - unchanged */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getTypeIcon(terms.type)}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{terms.title}</h2>
              <p className="text-sm text-gray-600">
                {getTypeLabel(terms.type)} • {terms.language.toUpperCase()} • v
                {terms.version}
              </p>
            </div>
          </div>
          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("rendered")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === "rendered"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Type className="w-4 h-4" />
                Rendered
              </button>
              <button
                onClick={() => setViewMode("markdown")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === "markdown"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Code className="w-4 h-4" />
                Markdown
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
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

        {/* Footer - unchanged */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <div>Created: {formatDate(terms.createdAt)}</div>
            <div>Last Updated: {formatDate(terms.updatedAt)}</div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Close
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
    if (
      !window.confirm(`Are you sure you want to delete "${termsItem.title}"?`)
    ) {
      return;
    }

    try {
      await termsAPI.deleteTerms(termsItem.id);
      showSuccess("Terms deleted successfully!");
      loadTerms();
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const handleSave = (savedTerms) => {
    loadTerms();
  };

  const getTypeIcon = (type) => {
    const typeConfig = termsTypes.find((t) => t.value === type);
    return typeConfig ? (
      <typeConfig.icon className="w-4 h-4" />
    ) : (
      <FileText className="w-4 h-4" />
    );
  };

  const getTypeLabel = (type) => {
    const typeConfig = termsTypes.find((t) => t.value === type);
    return typeConfig ? typeConfig.label : type;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Terms & Conditions Management
        </h1>
        <div className="flex gap-2">
          <button
            onClick={loadTerms}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Terms
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search terms..."
              value={filters.query}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {termsTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={filters.language}
            onChange={(e) => handleFilterChange("language", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
          </select>

          {/* Active Filter */}
          <select
            value={filters.active}
            onChange={(e) => handleFilterChange("active", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Terms Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort("type")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Type
                  {sortBy === "type" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("title")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Title
                  {sortBy === "title" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("language")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Language
                  {sortBy === "language" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  onClick={() => handleSort("updatedAt")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Last Updated
                  {sortBy === "updatedAt" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : terms.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No terms found
                  </td>
                </tr>
              ) : (
                terms.map((termsItem) => (
                  <tr key={termsItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(termsItem.type)}
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {getTypeLabel(termsItem.type)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {termsItem.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 uppercase">
                          {termsItem.language}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${
                          termsItem.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {termsItem.active ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {termsItem.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(termsItem.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePreview(termsItem)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(termsItem)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(termsItem)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </div>
  );
};

export default TermsManagement;
