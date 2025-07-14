// src/components/PetManagement.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Heart,
  Calendar,
  User,
  MapPin,
  Info,
  X,
  Save,
  Upload,
  RefreshCw,
  PawPrint,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { petAPI, userAPI } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { parseValidationErrors } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";
import { useDebounce } from "../hooks/useDebounce";
import { formatPrice, formatNumber } from "../utils/formatUtils";

// Pet Detail Modal Component
const PetDetailModal = ({ pet, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !pet) return null;

  const getSpeciesIcon = (species) => {
    switch (species) {
      case "DOG":
        return <Dog className="w-6 h-6 text-amber-600" />;
      case "CAT":
        return <Cat className="w-6 h-6 text-purple-600" />;
      case "BIRD":
        return <Bird className="w-6 h-6 text-blue-600" />;
      case "FISH":
        return <Fish className="w-6 h-6 text-cyan-600" />;
      case "RABBIT":
        return <Rabbit className="w-6 h-6 text-pink-600" />;
      default:
        return <PawPrint className="w-6 h-6 text-gray-600" />;
    }
  };

  const getSpeciesLabel = (species) => {
    switch (species) {
      case "DOG":
        return "Dog";
      case "CAT":
        return "Cat";
      case "BIRD":
        return "Bird";
      case "FISH":
        return "Fish";
      case "RABBIT":
        return "Rabbit";
      default:
        return species;
    }
  };

  const getAgeDisplay = (age, dayOfBirth) => {
    if (age) return `${age} years old`;
    if (dayOfBirth) {
      const birthDate = new Date(dayOfBirth);
      const today = new Date();
      const ageInYears = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return `${ageInYears - 1} years old`;
      }
      return `${ageInYears} years old`;
    }
    return "Unknown age";
  };

  const getStatusBadge = (pet) => {
    if (pet.deletedAt) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Deleted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getSpeciesIcon(pet.species)}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{pet.name}</h2>
              <p className="text-sm text-gray-600">
                {getSpeciesLabel(pet.species)} •{" "}
                {getAgeDisplay(pet.age, pet.dayOfBirth)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(pet)}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pet Image */}
          {pet.imageUrl && (
            <div className="text-center">
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-48 h-48 object-cover rounded-full mx-auto border-4 border-gray-100 shadow-lg"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Pet Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet ID
                </label>
                <p className="text-sm text-gray-900 font-mono">{pet.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-sm text-gray-900 font-medium">{pet.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Species
                </label>

                <p className="text-sm text-gray-900">
                  {getSpeciesIcon(pet.species)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <p className="text-sm text-gray-900">
                  {pet.breed || "Mixed/Unknown"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <p className="text-sm text-gray-900 capitalize">
                  {pet.gender || "Unknown"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <p className="text-sm text-gray-900 capitalize">
                  {pet.size || "Unknown"}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Additional Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner ID
                </label>
                <p className="text-sm text-gray-900 font-mono">{pet.userId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <p className="text-sm text-gray-900">
                  {getAgeDisplay(pet.age, pet.dayOfBirth)}
                </p>
              </div>

              {pet.dayOfBirth && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(pet.dayOfBirth)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(pet.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(pet.updatedAt)}
                </p>
              </div>

              {pet.deletedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deleted At
                  </label>
                  <p className="text-sm text-red-600">
                    {formatDate(pet.deletedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {pet.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
                Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {pet.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(pet.updatedAt)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {!pet.deletedAt && (
              <>
                <button
                  onClick={() => onEdit(pet)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(pet)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Pet Editor Modal Component
const PetEditorModal = ({
  pet,
  isOpen,
  onClose,
  onSave,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    ownerId: "",
    name: "",
    age: "",
    dayOfBirth: "",
    species: "DOG",
    breed: "",
    gender: "",
    size: "",
    imageUrl: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);
  const { showSuccess, showError } = useToast();

  const speciesOptions = [
    { value: "DOG", label: "Dog", icon: Dog },
    { value: "CAT", label: "Cat", icon: Cat },
    { value: "BIRD", label: "Bird", icon: Bird },
    { value: "FISH", label: "Fish", icon: Fish },
    { value: "RABBIT", label: "Rabbit", icon: Rabbit },
  ];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "unknown", label: "Unknown" },
  ];

  const sizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "extra_large", label: "Extra Large" },
  ];

  useEffect(() => {
    if (pet && isEditing) {
      setFormData({
        ownerId: pet.userId || "",
        name: pet.name || "",
        age: pet.age || "",
        dayOfBirth: pet.dayOfBirth || "",
        species: pet.species || "DOG",
        breed: pet.breed || "",
        gender: pet.gender || "",
        size: pet.size || "",
        imageUrl: pet.imageUrl || "",
        description: pet.description || "",
      });
    } else {
      setFormData({
        ownerId: "",
        name: "",
        age: "",
        dayOfBirth: "",
        species: "DOG",
        breed: "",
        gender: "",
        size: "",
        imageUrl: "",
        description: "",
      });
    }
    setValidationErrors({});
  }, [pet, isEditing, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  const loadOwners = async () => {
    setLoadingOwners(true);
    try {
      const response = await userAPI.getUsers({ page: 1, size: 100 });
      setOwners(response.data.data || []);
    } catch (error) {
      console.error("Error loading owners:", error);
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    try {
      let response;
      const submitData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      };

      if (isEditing) {
        response = await petAPI.updatePet(pet.id, submitData);
      } else {
        response = await petAPI.createPet(submitData);
      }

      showSuccess(`Pet ${isEditing ? "updated" : "created"} successfully!`);
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
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Edit Pet" : "Add New Pet"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Owner Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner *
            </label>
            <select
              value={formData.ownerId}
              onChange={(e) => handleInputChange("ownerId", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.ownerId ? "border-red-500" : "border-gray-300"
              }`}
              required
              disabled={loadingOwners}
            >
              <option value="">Select an owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} {owner.lastName} ({owner.email})
                </option>
              ))}
            </select>
            {validationErrors.ownerId && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.ownerId}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter pet name"
                required
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Species *
              </label>
              <select
                value={formData.species}
                onChange={(e) => handleInputChange("species", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.species
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
              >
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.species && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.species}
                </p>
              )}
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed
              </label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => handleInputChange("breed", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.breed ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter breed"
              />
              {validationErrors.breed && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.breed}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.gender ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select gender</option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.gender && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.gender}
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age (years)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.age ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter age"
              />
              {validationErrors.age && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.age}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dayOfBirth}
                onChange={(e) =>
                  handleInputChange("dayOfBirth", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.dayOfBirth
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.dayOfBirth && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.dayOfBirth}
                </p>
              )}
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.size ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select size</option>
                {sizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {validationErrors.size && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.size}
                </p>
              )}
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.imageUrl
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter image URL"
              />
              {validationErrors.imageUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.imageUrl}
                </p>
              )}
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Pet preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.description
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter pet description, medical history, special needs, etc."
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEditing ? "Update Pet" : "Add Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserPetsModal = ({ userId, userName, isOpen, onClose }) => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const { showError } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      loadUserPets();
    }
  }, [isOpen, userId, pagination.page]);

  const loadUserPets = async () => {
    setLoading(true);
    try {
      const response = await petAPI.getPetsByUserId(userId, {
        page: pagination.page,
        size: pagination.size,
      });
      setPets(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.paging.totalPage,
        totalElements: response.data.paging.totalItem,
        page: response.data.paging.pageNumber,
        size: response.data.paging.pageSize,
      }));
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const getSpeciesIcon = (species) => {
    switch (species) {
      case "DOG":
        return <Dog className="w-5 h-5 text-amber-600" />;
      case "CAT":
        return <Cat className="w-5 h-5 text-purple-600" />;
      case "BIRD":
        return <Bird className="w-5 h-5 text-blue-600" />;
      case "FISH":
        return <Fish className="w-5 h-5 text-cyan-600" />;
      case "RABBIT":
        return <Rabbit className="w-5 h-5 text-pink-600" />;
      default:
        return <PawPrint className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSpeciesLabel = (species) => {
    switch (species) {
      case "DOG":
        return "Dog";
      case "CAT":
        return "Cat";
      case "BIRD":
        return "Bird";
      case "FISH":
        return "Fish";
      case "RABBIT":
        return "Rabbit";
      default:
        return species;
    }
  };

  const getAgeDisplay = (age, dayOfBirth) => {
    if (age) return `${age} years old`;
    if (dayOfBirth) {
      const birthDate = new Date(dayOfBirth);
      const today = new Date();
      const ageInYears = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return `${ageInYears - 1} years old`;
      }
      return `${ageInYears} years old`;
    }
    return "Unknown age";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {userName ? `${userName}'s Pets` : "User Pets"}
              </h2>
              <p className="text-sm text-gray-600">User ID: {userId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mr-3" />
              <span className="text-gray-600">Loading pets...</span>
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-8">
              <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No pets found for this user
              </p>
            </div>
          ) : (
            <>
              {/* Pets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Pet Image */}
                    <div className="text-center mb-4">
                      {pet.imageUrl ? (
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="w-20 h-20 object-cover rounded-full mx-auto border-2 border-gray-100"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
                          <PawPrint className="w-8 h-8 text-gray-500" />
                        </div>
                      )}
                      <div
                        className="w-20 h-20 bg-gray-300 rounded-full items-center justify-center mx-auto"
                        style={{ display: "none" }}
                      >
                        <PawPrint className="w-8 h-8 text-gray-500" />
                      </div>
                    </div>

                    {/* Pet Info */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {pet.name}
                      </h3>

                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getSpeciesIcon(pet.species)}
                        <span className="text-sm text-gray-600">
                          {getSpeciesLabel(pet.species)}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        {pet.breed && (
                          <p>
                            <span className="font-medium">Breed:</span>{" "}
                            {pet.breed}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Age:</span>{" "}
                          {getAgeDisplay(pet.age, pet.dayOfBirth)}
                        </p>
                        {pet.gender && (
                          <p>
                            <span className="font-medium">Gender:</span>{" "}
                            {pet.gender}
                          </p>
                        )}
                        {pet.size && (
                          <p>
                            <span className="font-medium">Size:</span>{" "}
                            {pet.size}
                          </p>
                        )}
                      </div>

                      {pet.description && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          <p className="line-clamp-3">{pet.description}</p>
                        </div>
                      )}

                      {/* Status */}
                      <div className="mt-3">
                        {pet.deletedAt ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Deleted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        )}
                      </div>

                      {/* Pet ID */}
                      <div className="mt-2 text-xs text-gray-400 font-mono">
                        ID: {pet.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.size + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.size,
                      pagination.totalElements
                    )}{" "}
                    of {pagination.totalElements} pets
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Statistics Component
const PetStatistics = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null);
  const [isUserPetsModalOpen, setIsUserPetsModalOpen] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers({ page: 1, size: 100 });
      setUsers(response.data.data || []);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserPets = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsUserPetsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              View Pets by User
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600">Select a user to view their pets:</p>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.name} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          ID: {user.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleViewUserPets(
                          user.id,
                          `${user.name} ${user.lastName}`
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <PawPrint className="w-4 h-4" />
                      View Pets
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Pets Modal */}
      <UserPetsModal
        userId={selectedUserId}
        userName={selectedUserName}
        isOpen={isUserPetsModalOpen}
        onClose={() => setIsUserPetsModalOpen(false)}
      />
    </>
  );
};

// Main Pet Management Component
const PetManagement = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [filters, setFilters] = useState({
    query: "",
    species: "",
    breed: "",
    gender: "",
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { showSuccess, showError } = useToast();
  const debouncedQuery = useDebounce(filters.query, 500);

  const speciesOptions = [
    { value: "DOG", label: "Dog", icon: Dog },
    { value: "CAT", label: "Cat", icon: Cat },
    { value: "BIRD", label: "Bird", icon: Bird },
    { value: "FISH", label: "Fish", icon: Fish },
    { value: "RABBIT", label: "Rabbit", icon: Rabbit },
  ];

  const loadPets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        sort: sortOrder,
        filters: {
          query: debouncedQuery,
          species: filters.species,
          breed: filters.breed,
          gender: filters.gender,
        },
      };

      const response = await petAPI.getPets(params);
      setPets(response.data.data);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.paging.totalPage,
        totalElements: response.data.paging.totalItem,
        page: response.data.paging.pageNumber,
        size: response.data.paging.pageSize,
      }));
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.size,
    debouncedQuery,
    filters.species,
    filters.breed,
    filters.gender,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, query: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const isSearching =
    filters.query !== debouncedQuery && filters.query.length > 0;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewPet = async (petId) => {
    try {
      const response = await petAPI.getPetById(petId);
      setSelectedPet(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const handleEditPet = async (petId) => {
    try {
      const response = await petAPI.getPetById(petId);
      setSelectedPet(response.data);
      setIsEditing(true);
      setIsEditorModalOpen(true);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const handleDeletePet = async (petId, petName) => {
    if (!window.confirm(`Are you sure you want to delete "${petName}"?`)) {
      return;
    }

    try {
      await petAPI.deletePet(petId);
      showSuccess("Pet deleted successfully!");
      loadPets();
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const handleCreateNew = () => {
    setSelectedPet(null);
    setIsEditing(false);
    setIsEditorModalOpen(true);
  };

  const handleSave = () => {
    loadPets();
  };

  const getSpeciesIcon = (species) => {
    const option = speciesOptions.find((opt) => opt.value === species);
    if (option) {
      const IconComponent = option.icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return <PawPrint className="w-4 h-4" />;
  };

  const getSpeciesLabel = (species) => {
    const option = speciesOptions.find((opt) => opt.value === species);
    return option ? option.label : species;
  };

  const getAgeDisplay = (age, dayOfBirth) => {
    if (age) return `${age}y`;
    if (dayOfBirth) {
      const birthDate = new Date(dayOfBirth);
      const today = new Date();
      const ageInYears = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return `${ageInYears - 1}y`;
      }
      return `${ageInYears}y`;
    }
    return "Unknown";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pet Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            View by User
          </button>
          <button
            onClick={loadPets}
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
            Add Pet
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
              placeholder="Search pets..."
              value={filters.query}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Species Filter */}
          <select
            value={filters.species}
            onChange={(e) => handleFilterChange("species", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Species</option>
            {speciesOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Breed Filter */}
          <input
            type="text"
            placeholder="Filter by breed..."
            value={filters.breed}
            onChange={(e) => handleFilterChange("breed", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Gender Filter */}
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange("gender", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      {/* Pets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Species
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Breed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Created
                  {sortBy === "createdAt" && (
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
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : pets.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No pets found
                  </td>
                </tr>
              ) : (
                pets.map((pet) => (
                  <tr key={pet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {pet.imageUrl ? (
                          <img
                            src={pet.imageUrl}
                            alt={pet.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                            <PawPrint className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div
                          className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center mr-3"
                          style={{ display: "none" }}
                        >
                          <PawPrint className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {pet.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pet.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getSpeciesIcon(pet.species)}
                        <span className="text-sm text-gray-900">
                          {getSpeciesLabel(pet.species)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pet.breed || "Mixed/Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getAgeDisplay(pet.age, pet.dayOfBirth)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">
                        {pet.gender || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {pet.userId
                          ? pet.userId.substring(0, 8) + "..."
                          : "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pet.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPet(pet.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPet(pet.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit Pet"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet.id, pet.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Pet"
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

        {/* Pagination */}
        {/* {pagination.totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.size + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.size,
                      pagination.totalElements
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {pagination.totalElements}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(pagination.totalPages, 5))].map(
                    (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )} */}
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {formatNumber((pagination.page - 1) * pagination.size + 1)}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {formatNumber(
                    Math.min(
                      pagination.page * pagination.size,
                      pagination.totalElements
                    )
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {formatNumber(pagination.totalElements)}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PetDetailModal
        pet={selectedPet}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(pet) => {
          setSelectedPet(pet);
          setIsDetailModalOpen(false);
          setIsEditing(true);
          setIsEditorModalOpen(true);
        }}
        onDelete={(pet) => {
          setIsDetailModalOpen(false);
          handleDeletePet(pet.id, pet.name);
        }}
      />

      <PetEditorModal
        pet={selectedPet}
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        onSave={handleSave}
        isEditing={isEditing}
      />

      {isStatsModalOpen && (
        <PetStatistics onClose={() => setIsStatsModalOpen(false)} />
      )}
    </div>
  );
};

export default PetManagement;
