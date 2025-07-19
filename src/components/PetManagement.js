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
import { formatDate, formatDate2 } from "../utils/dateUtils";
import { parseValidationErrors } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";
import { useDebounce } from "../hooks/useDebounce";
import { formatPrice, formatNumber } from "../utils/formatUtils";
import ConfirmationModal from "./common/ConfirmationModal";

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

  const getSpeciesColor = (species) => {
    switch (species) {
      case "DOG":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-700",
        };
      case "CAT":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-700",
        };
      case "BIRD":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
        };
      case "FISH":
        return {
          bg: "bg-cyan-50",
          border: "border-cyan-200",
          text: "text-cyan-700",
        };
      case "RABBIT":
        return {
          bg: "bg-pink-50",
          border: "border-pink-200",
          text: "text-pink-700",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
        };
    }
  };

  const speciesColors = getSpeciesColor(pet.species);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-white/20 overflow-hidden">
        {/* Enhanced Header - Fixed */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white flex-shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+CjwvZz4KPC9zdmc+')] opacity-30"></div>

          <div className="relative px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  {getSpeciesIcon(pet.species)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {pet.name}
                  </h2>
                  <div className="flex items-center gap-4 text-white/80">
                    <span className="flex items-center gap-2">
                      <PawPrint className="w-4 h-4" />
                      {getSpeciesLabel(pet.species)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {getAgeDisplay(pet.age, pet.dayOfBirth)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {getStatusBadge(pet)}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-2xl transition-all duration-200 hover:scale-110"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Fixed with proper scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 pb-16">
            {/* Pet Image and Quick Info */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Pet Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="w-64 h-64 object-cover rounded-3xl border-4 border-white shadow-2xl"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div className="w-64 h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center">
                        <PawPrint className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                    <div
                      className="w-64 h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl border-4 border-white shadow-2xl items-center justify-center"
                      style={{ display: "none" }}
                    >
                      <PawPrint className="w-20 h-20 text-gray-400" />
                    </div>

                    {/* Status Indicator */}
                    <div className="absolute -top-2 -right-2">
                      {pet.deletedAt ? (
                        <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Info Cards */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-6 rounded-2xl ${speciesColors.bg} ${speciesColors.border} border-2`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {getSpeciesIcon(pet.species)}
                      <h3 className={`text-lg font-bold ${speciesColors.text}`}>
                        Species
                      </h3>
                    </div>
                    <p className={`text-2xl font-bold ${speciesColors.text}`}>
                      {getSpeciesLabel(pet.species)}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-blue-50 border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-bold text-blue-700">Age</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {getAgeDisplay(pet.age, pet.dayOfBirth)}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
                    <div className="flex items-center gap-3 mb-3">
                      <Info className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-lg font-bold text-emerald-700">
                        Breed
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">
                      {pet.breed || "Mixed/Unknown"}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-orange-50 border-2 border-orange-200">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-6 h-6 text-orange-600" />
                      <h3 className="text-lg font-bold text-orange-700">
                        Gender
                      </h3>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 capitalize">
                      {pet.gender || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Basic Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Basic Information
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Pet ID
                    </span>
                    <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg">
                      {pet.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Full Name
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {pet.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Species
                    </span>
                    <div className="flex items-center gap-2">
                      {getSpeciesIcon(pet.species)}
                      <span className="text-sm font-medium text-gray-900">
                        {getSpeciesLabel(pet.species)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Breed
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {pet.breed || "Mixed/Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Gender
                    </span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {pet.gender || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium text-gray-600">
                      Size
                    </span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {pet.size || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Owner & System Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Owner & System Info
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Owner ID
                    </span>
                    <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-lg">
                      {pet.userId ? `${pet.userId}` : "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Age
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {getAgeDisplay(pet.age, pet.dayOfBirth)}
                    </span>
                  </div>

                  {pet.dayOfBirth && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Date of Birth
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate2(pet.dayOfBirth)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      Created At
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate2(pet.createdAt ?? "N/A")}
                    </span>
                  </div>

                  {pet.updatedAt && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Last Updated
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate2(pet.updatedAt)}
                      </span>
                    </div>
                  )}

                  {pet.deletedAt && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-gray-600">
                        Deleted At
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        {formatDate2(pet.deletedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {pet.description && (
              <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    About {pet.name}
                  </h3>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {pet.description}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Timeline</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Pet Created</p>
                    <p className="text-sm text-green-600">
                      {formatDate2(pet.createdAt)}
                    </p>
                  </div>
                </div>

                {pet.updatedAt !== pet.createdAt && pet.updatedAt && (
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Edit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Last Updated</p>
                      <p className="text-sm text-blue-600">
                        {formatDate2(pet.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {pet.deletedAt && (
                  <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-200">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-red-800">Pet Deleted</p>
                      <p className="text-sm text-red-600">
                        {formatDate2(pet.deletedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer - Fixed */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              {pet.updatedAt && (
                <div className="text-sm text-gray-600">
                  Last updated: {formatDate2(pet.updatedAt)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200 hover:scale-105"
              >
                Close
              </button>

              {!pet.deletedAt && (
                <>
                  <button
                    onClick={() => onEdit(pet)}
                    className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Edit className="w-5 h-5 relative z-10" />
                    <span className="relative z-10 font-medium">Edit Pet</span>
                  </button>

                  <button
                    onClick={() => onDelete(pet)}
                    className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Trash2 className="w-5 h-5 relative z-10" />
                    <span className="relative z-10 font-medium">
                      Delete Pet
                    </span>
                  </button>
                </>
              )}
            </div>
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
  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { showSuccess, showError } = useToast();

  const speciesOptions = [
    {
      value: "DOG",
      label: "Dog",
      icon: Dog,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      value: "CAT",
      label: "Cat",
      icon: Cat,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      value: "BIRD",
      label: "Bird",
      icon: Bird,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      value: "FISH",
      label: "Fish",
      icon: Fish,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      value: "RABBIT",
      label: "Rabbit",
      icon: Rabbit,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
  ];

  const genderOptions = [
    {
      value: "male",
      label: "Male",
      icon: "♂️",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      value: "female",
      label: "Female",
      icon: "♀️",
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      value: "unknown",
      label: "Unknown",
      icon: "❓",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  const sizeOptions = [
    { value: "small", label: "Small", icon: "🐁", description: "Up to 25 lbs" },
    { value: "medium", label: "Medium", icon: "🐕", description: "25-60 lbs" },
    { value: "large", label: "Large", icon: "🐕‍🦺", description: "60-100 lbs" },
    {
      value: "extra_large",
      label: "Extra Large",
      icon: "🐕‍🦺",
      description: "100+ lbs",
    },
  ];

  const steps = [
    { id: 1, title: "Basic Info", description: "Name, species, and owner" },
    { id: 2, title: "Details", description: "Physical characteristics" },
    { id: 3, title: "Additional", description: "Photos and description" },
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
      setImagePreview(pet.imageUrl || null);
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
      setImagePreview(null);
    }
    setValidationErrors({});
    setCurrentStep(1);
  }, [pet, isEditing, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadOwners();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.imageUrl && formData.imageUrl !== imagePreview) {
      setImagePreview(formData.imageUrl);
    }
  }, [formData.imageUrl]);

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

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.ownerId && formData.species;
      case 2:
        return true; // All fields in step 2 are optional
      case 3:
        return true; // All fields in step 3 are optional
      default:
        return false;
    }
  };

  const getSelectedSpecies = () => {
    return (
      speciesOptions.find((option) => option.value === formData.species) ||
      speciesOptions[0]
    );
  };

  const getSelectedGender = () => {
    return genderOptions.find((option) => option.value === formData.gender);
  };

  const getSelectedSize = () => {
    return sizeOptions.find((option) => option.value === formData.size);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-white/20 overflow-hidden">
        {/* Enhanced Header - Fixed */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white flex-shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+CjwvZz4KPC9zdmc+')] opacity-30"></div>

          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  {isEditing ? (
                    <Edit className="w-8 h-8 text-white" />
                  ) : (
                    <Plus className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isEditing ? "Edit Pet" : "Add New Pet"}
                  </h2>
                  <p className="text-green-100 text-sm font-medium">
                    {isEditing
                      ? "Update pet information"
                      : "Create a new pet profile"}
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
        </div>

        {/* Step Progress - Fixed */}
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-3 ${
                    index !== steps.length - 1 ? "flex-1" : ""
                  }`}
                >
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p
                      className={`font-medium ${
                        currentStep >= step.id
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content - Fixed with proper scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Basic Information
                    </h3>
                    <p className="text-gray-600">
                      Let's start with the essentials
                    </p>
                  </div>

                  {/* Owner Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Pet Owner *
                    </label>
                    <select
                      value={formData.ownerId}
                      onChange={(e) =>
                        handleInputChange("ownerId", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                        validationErrors.ownerId
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white/50"
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
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.ownerId}
                      </p>
                    )}
                  </div>

                  {/* Pet Name */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Heart className="w-4 h-4 inline mr-2" />
                      Pet Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                        validationErrors.name
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white/50"
                      }`}
                      placeholder="Enter your pet's name"
                      required
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Species Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <PawPrint className="w-4 h-4 inline mr-2" />
                      Species *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {speciesOptions.map((option) => {
                        const IconComponent = option.icon;
                        const isSelected = formData.species === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleInputChange("species", option.value)
                            }
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? "border-green-500 bg-green-50 shadow-lg"
                                : "border-gray-200 bg-white/50 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div
                                className={`p-3 rounded-xl ${
                                  isSelected ? option.bgColor : "bg-gray-100"
                                }`}
                              >
                                <IconComponent
                                  className={`w-6 h-6 ${
                                    isSelected ? option.color : "text-gray-500"
                                  }`}
                                />
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isSelected
                                    ? "text-green-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {validationErrors.species && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.species}
                      </p>
                    )}
                  </div>

                  {/* Add some bottom padding to ensure last element is visible */}
                  <div className="pb-8"></div>
                </div>
              )}

              {/* Step 2: Physical Details */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Physical Details
                    </h3>
                    <p className="text-gray-600">
                      Tell us about your pet's characteristics
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Breed */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Info className="w-4 h-4 inline mr-2" />
                        Breed
                      </label>
                      <input
                        type="text"
                        value={formData.breed}
                        onChange={(e) =>
                          handleInputChange("breed", e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                          validationErrors.breed
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 bg-white/50"
                        }`}
                        placeholder="e.g., Golden Retriever, Persian, etc."
                      />
                      {validationErrors.breed && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.breed}
                        </p>
                      )}
                    </div>

                    {/* Age */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Age (years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.age}
                        onChange={(e) =>
                          handleInputChange("age", e.target.value)
                        }
                        className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                          validationErrors.age
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 bg-white/50"
                        }`}
                        placeholder="Enter age in years"
                      />
                      {validationErrors.age && (
                        <p className="text-red-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {validationErrors.age}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.dayOfBirth}
                      onChange={(e) =>
                        handleInputChange("dayOfBirth", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                        validationErrors.dayOfBirth
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white/50"
                      }`}
                    />
                    {validationErrors.dayOfBirth && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.dayOfBirth}
                      </p>
                    )}
                  </div>

                  {/* Gender Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {genderOptions.map((option) => {
                        const isSelected = formData.gender === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleInputChange("gender", option.value)
                            }
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? "border-green-500 bg-green-50 shadow-lg"
                                : "border-gray-200 bg-white/50 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div
                                className={`p-3 rounded-xl ${
                                  isSelected ? option.bgColor : "bg-gray-100"
                                }`}
                              >
                                <span className="text-2xl">{option.icon}</span>
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isSelected
                                    ? "text-green-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Size
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {sizeOptions.map((option) => {
                        const isSelected = formData.size === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              handleInputChange("size", option.value)
                            }
                            className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                              isSelected
                                ? "border-green-500 bg-green-50 shadow-lg"
                                : "border-gray-200 bg-white/50 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="text-2xl">{option.icon}</div>
                              <span
                                className={`text-sm font-medium ${
                                  isSelected
                                    ? "text-green-600"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {option.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add some bottom padding */}
                  <div className="pb-8"></div>
                </div>
              )}

              {/* Step 3: Additional Information */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Additional Information
                    </h3>
                    <p className="text-gray-600">
                      Add photos and description to complete the profile
                    </p>
                  </div>

                  {/* Image Section */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Upload className="w-4 h-4 inline mr-2" />
                      Pet Photo
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) =>
                            handleInputChange("imageUrl", e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${
                            validationErrors.imageUrl
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 bg-white/50"
                          }`}
                          placeholder="Enter image URL"
                        />
                        {validationErrors.imageUrl && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {validationErrors.imageUrl}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-center">
                        {imagePreview ? (
                          <div className="relative group">
                            <img
                              src={imagePreview}
                              alt="Pet preview"
                              className="w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                            <div
                              className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg"
                              style={{ display: "none" }}
                            >
                              <PawPrint className="w-10 h-10 text-gray-500" />
                            </div>
                            <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center">
                            <Upload className="w-10 h-10 text-gray-500" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Info className="w-4 h-4 inline mr-2" />
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={5}
                      className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 resize-none ${
                        validationErrors.description
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 bg-white/50"
                      }`}
                      placeholder="Tell us about your pet's personality, medical history, special needs, favorite activities, etc."
                    />
                    {validationErrors.description && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Pet Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-green-700">
                            Name:
                          </span>{" "}
                          {formData.name || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium text-green-700">
                            Species:
                          </span>{" "}
                          {getSelectedSpecies().label}
                        </div>
                        <div>
                          <span className="font-medium text-green-700">
                            Breed:
                          </span>{" "}
                          {formData.breed || "Not specified"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-green-700">
                            Age:
                          </span>{" "}
                          {formData.age
                            ? `${formData.age} years`
                            : "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium text-green-700">
                            Gender:
                          </span>{" "}
                          {getSelectedGender()?.label || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium text-green-700">
                            Size:
                          </span>{" "}
                          {getSelectedSize()?.label || "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add some bottom padding */}
                  <div className="pb-8"></div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Enhanced Footer - Fixed */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isEditing ? "Update Pet" : "Create Pet"}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+CjwvZz4KPC9zdmc+')] opacity-30"></div>

          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {userName ? `${userName}'s Pets` : "User Pets"}
                  </h2>
                  <p className="text-blue-100 text-sm font-medium">
                    User ID: {userId?.substring(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Pet Count Badge */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">
                      {formatNumber(pagination.totalElements)}
                    </span>
                    <span className="text-blue-100 text-sm">pets</span>
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
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <PawPrint className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-gray-600 text-lg font-medium">
                Loading pets...
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Please wait while we fetch the pet data
              </div>
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <PawPrint className="w-12 h-12 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No pets found
              </h3>
              <p className="text-gray-500 text-lg">
                This user hasn't registered any pets yet
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-2xl inline-block">
                <p className="text-blue-600 text-sm">
                  💡 Pets will appear here once the user adds them to their
                  profile
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Enhanced Pets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {pets.map((pet, index) => (
                  <div
                    key={pet.id}
                    className="group relative bg-white/80 backdrop-blur-sm border border-white/20 rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/90"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: "fadeInUp 0.6s ease-out forwards",
                    }}
                  >
                    {/* Pet Image */}
                    <div className="relative text-center mb-4">
                      <div className="relative inline-block">
                        {pet.imageUrl ? (
                          <img
                            src={pet.imageUrl}
                            alt={pet.name}
                            className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <PawPrint className="w-10 h-10 text-gray-500" />
                          </div>
                        )}
                        <div
                          className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full items-center justify-center border-4 border-white shadow-lg"
                          style={{ display: "none" }}
                        >
                          <PawPrint className="w-10 h-10 text-gray-500" />
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute -top-1 -right-1">
                          {pet.deletedAt ? (
                            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                              <AlertCircle className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pet Info */}
                    <div className="text-center space-y-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {pet.name}
                        </h3>

                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="p-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                            {getSpeciesIcon(pet.species)}
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {getSpeciesLabel(pet.species)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {pet.breed && (
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">
                              <span className="font-medium">Breed:</span>{" "}
                              {pet.breed}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">
                            <span className="font-medium">Age:</span>{" "}
                            {getAgeDisplay(pet.age, pet.dayOfBirth)}
                          </span>
                        </div>

                        {pet.gender && (
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-600 capitalize">
                              <span className="font-medium">Gender:</span>{" "}
                              {pet.gender}
                            </span>
                          </div>
                        )}

                        {pet.size && (
                          <div className="flex items-center justify-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-gray-600 capitalize">
                              <span className="font-medium">Size:</span>{" "}
                              {pet.size}
                            </span>
                          </div>
                        )}
                      </div>

                      {pet.description && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                            {pet.description}
                          </p>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="pt-3">
                        {pet.deletedAt ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Deleted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        )}
                      </div>

                      {/* Pet ID */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-lg inline-block">
                          ID: {pet.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none"></div>
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-bold text-blue-600">
                          {formatNumber(
                            (pagination.page - 1) * pagination.size + 1
                          )}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-blue-600">
                          {formatNumber(
                            Math.min(
                              pagination.page * pagination.size,
                              pagination.totalElements
                            )
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-blue-600">
                          {formatNumber(pagination.totalElements)}
                        </span>{" "}
                        pets
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, pagination.totalPages))].map(
                          (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                                  pagination.page === page
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110"
                                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            <button
              onClick={onClose}
              className="group relative px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <X className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-medium">Close</span>
            </button>
          </div>
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
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                      <div className="flex items-start flex-col">
                        <h3 className="font-medium text-gray-900">
                          {user.name} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-400 font-mono">
                          ID: {user.id}
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 flex items-center gap-2"
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
  const debouncedQuery = useDebounce(filters.query, 700);

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: "warning",
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
    icon: null,
    isLoading: false,
  });

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
    setConfirmationModal({
      isOpen: true,
      type: "danger",
      title: `Delete Pet`,
      message: `Are you sure you want to delete ${petName}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      icon: Trash2,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));

        try {
          await petAPI.deletePet(petId);
          showSuccess("Pet deleted successfully!");
          loadPets();
        } catch (error) {
          const parsedError = parseValidationErrors(error);
          showError(parsedError.message);
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
    });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section with Gradient */}
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
                  <PawPrint className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Pet Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage and monitor all pets in your system
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Heart className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pagination.totalElements)}
                      </p>
                      <p className="text-sm text-gray-600">Total Pets</p>
                    </div>
                  </div>
                </div>

                {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pets.filter((p) => !p.deletedAt).length)}
                      </p>
                      <p className="text-sm text-gray-600">Active Pets</p>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsStatsModalOpen(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Users className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">View by User</span>
              </button>

              <button
                onClick={loadPets}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RefreshCw className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Refresh</span>
              </button>

              <button
                onClick={handleCreateNew}
                className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Add Pet</span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search Pets
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, breed..."
                  value={filters.query}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Species Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Species
              </label>
              <select
                value={filters.species}
                onChange={(e) => handleFilterChange("species", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Species</option>
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Breed Filter */}
            {/* <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Breed</label>
              <input
                type="text"
                placeholder="Filter by breed..."
                value={filters.breed}
                onChange={(e) => handleFilterChange("breed", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              />
            </div> */}

            {/* Gender Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 mt-8 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Pet Directory
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(pagination.totalElements)} pets total
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Species
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Breed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Owner
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {sortBy === "createdAt" && (
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
                    <td colSpan="8" className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <PawPrint className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="text-gray-600">Loading pets...</div>
                      </div>
                    </td>
                  </tr>
                ) : pets.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-gray-100 rounded-full">
                          <PawPrint className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className="text-gray-500 text-lg">
                          No pets found
                        </div>
                        <div className="text-gray-400 text-sm">
                          Try adjusting your search filters
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pets.map((pet, index) => (
                    <tr
                      key={pet.id}
                      className="hover:bg-blue-50/50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {pet.imageUrl ? (
                              <img
                                src={pet.imageUrl}
                                alt={pet.name}
                                className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-lg">
                                <PawPrint className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div
                              className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl items-center justify-center shadow-lg"
                              style={{ display: "none" }}
                            >
                              <PawPrint className="w-5 h-5 text-gray-500" />
                            </div>
                            {!pet.deletedAt && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {pet.name}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              {pet.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            {getSpeciesLabel(pet.species)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-900 font-medium">
                          {pet.breed || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          <Calendar className="w-4 h-4" />
                          {getAgeDisplay(pet.age, pet.dayOfBirth)}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-mono">
                          <User className="w-4 h-4" />
                          {pet.userId
                            ? pet.userId.substring(0, 6) + "..."
                            : "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-600 font-medium">
                          {formatDate2(pet.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPet(pet.id)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditPet(pet.id)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Edit Pet"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePet(pet.id, pet.name)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Delete Pet"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-bold text-blue-600">
                    {formatNumber((pagination.page - 1) * pagination.size + 1)}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-blue-600">
                    {formatNumber(
                      Math.min(
                        pagination.page * pagination.size,
                        pagination.totalElements
                      )
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-blue-600">
                    {formatNumber(pagination.totalElements)}
                  </span>{" "}
                  results
                </div>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                              pagination.page === page
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
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
      ></ConfirmationModal>
    </div>
  );
};

export default PetManagement;
