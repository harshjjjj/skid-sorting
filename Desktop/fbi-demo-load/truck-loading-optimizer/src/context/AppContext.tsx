import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Skid, TruckDimensions, LoadingPlan, LoadingSequence, UnitSystem, SavedTemplate } from '../models/types';
import { DEFAULT_TRUCK_DIMENSIONS_METRIC, DEFAULT_TRUCK_DIMENSIONS_IMPERIAL, DEFAULT_UNIT_SYSTEM } from '../utils/constants';
import { optimizeLoading, generateLoadingInstructions } from '../services/optimizationAlgorithm';

interface AppContextType {
  // Unit system
  unitSystem: UnitSystem;
  setUnitSystem: (unitSystem: UnitSystem) => void;
  toggleUnitSystem: () => void;
  
  // Truck dimensions
  truckDimensions: TruckDimensions;
  setTruckDimensions: (dimensions: TruckDimensions) => void;
  resetTruckDimensions: () => void;
  
  // Skids
  skids: Skid[];
  addSkid: (skid: Skid) => void;
  updateSkid: (id: string, updatedSkid: Partial<Skid>) => void;
  removeSkid: (id: string) => void;
  clearSkids: () => void;
  
  // Loading plan
  loadingPlan: LoadingPlan | null;
  generateLoadingPlan: () => void;
  clearLoadingPlan: () => void;
  
  // Loading sequence
  loadingSequence: LoadingSequence | null;
  generateLoadingSequence: () => void;
  
  // Templates
  savedTemplates: SavedTemplate[];
  saveTemplate: (name: string, description?: string) => void;
  loadTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
  
  // Animation
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
  currentAnimationStep: number;
  setCurrentAnimationStep: (step: number) => void;
  
  // UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Unit system state
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(DEFAULT_UNIT_SYSTEM);
  
  // Toggle between metric and imperial unit systems
  const toggleUnitSystem = () => {
    setUnitSystem((prevSystem) => {
      const newSystem = prevSystem === 'metric' ? 'imperial' : 'metric';
      // Update truck dimensions to match the new unit system
      setTruckDimensions(
        newSystem === 'metric' ? DEFAULT_TRUCK_DIMENSIONS_METRIC : DEFAULT_TRUCK_DIMENSIONS_IMPERIAL
      );
      return newSystem;
    });
  };
  
  // Truck dimensions state
  const [truckDimensions, setTruckDimensions] = useState<TruckDimensions>(
    unitSystem === 'metric' ? DEFAULT_TRUCK_DIMENSIONS_METRIC : DEFAULT_TRUCK_DIMENSIONS_IMPERIAL
  );
  
  // Skids state
  const [skids, setSkids] = useState<Skid[]>([]);
  
  // Loading plan state
  const [loadingPlan, setLoadingPlan] = useState<LoadingPlan | null>(null);
  
  // Loading sequence state
  const [loadingSequence, setLoadingSequence] = useState<LoadingSequence | null>(null);
  
  // Templates state
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [currentAnimationStep, setCurrentAnimationStep] = useState<number>(0);
  
  // UI state
  const [activeTab, setActiveTab] = useState<string>('input');
  
  // Reset truck dimensions
  const resetTruckDimensions = () => {
    setTruckDimensions(
      unitSystem === 'metric' ? DEFAULT_TRUCK_DIMENSIONS_METRIC : DEFAULT_TRUCK_DIMENSIONS_IMPERIAL
    );
  };
  
  // Add a new skid
  const addSkid = (skid: Skid) => {
    setSkids((prevSkids) => [...prevSkids, skid]);
  };
  
  // Update an existing skid
  const updateSkid = (id: string, updatedSkid: Partial<Skid>) => {
    setSkids((prevSkids) =>
      prevSkids.map((skid) => (skid.id === id ? { ...skid, ...updatedSkid } : skid))
    );
  };
  
  // Remove a skid
  const removeSkid = (id: string) => {
    setSkids((prevSkids) => prevSkids.filter((skid) => skid.id !== id));
  };
  
  // Clear all skids
  const clearSkids = () => {
    setSkids([]);
  };
  
  // Generate a loading plan
  const generateLoadingPlan = () => {
    const plan = optimizeLoading(skids, truckDimensions);
    setLoadingPlan(plan);
    return plan;
  };
  
  // Clear the loading plan
  const clearLoadingPlan = () => {
    setLoadingPlan(null);
    setLoadingSequence(null);
  };
  
  // Generate loading sequence
  const generateLoadingSequence = () => {
    if (!loadingPlan) {
      const plan = generateLoadingPlan();
      const sequence = generateLoadingInstructions(plan);
      setLoadingSequence(sequence);
      return sequence;
    } else {
      const sequence = generateLoadingInstructions(loadingPlan);
      setLoadingSequence(sequence);
      return sequence;
    }
  };
  
  // Save a template
  const saveTemplate = (name: string, description?: string) => {
    const newTemplate: SavedTemplate = {
      id: `template-${Date.now()}`,
      name,
      description,
      truckDimensions,
      skids,
      createdAt: new Date(),
      lastModified: new Date(),
    };
    
    setSavedTemplates((prevTemplates) => [...prevTemplates, newTemplate]);
  };
  
  // Load a template
  const loadTemplate = (templateId: string) => {
    const template = savedTemplates.find((t) => t.id === templateId);
    
    if (template) {
      setTruckDimensions(template.truckDimensions);
      setSkids(template.skids);
      clearLoadingPlan();
    }
  };
  
  // Delete a template
  const deleteTemplate = (templateId: string) => {
    setSavedTemplates((prevTemplates) =>
      prevTemplates.filter((template) => template.id !== templateId)
    );
  };
  
  const contextValue: AppContextType = {
    unitSystem,
    setUnitSystem,
    toggleUnitSystem,
    truckDimensions,
    setTruckDimensions,
    resetTruckDimensions,
    skids,
    addSkid,
    updateSkid,
    removeSkid,
    clearSkids,
    loadingPlan,
    generateLoadingPlan,
    clearLoadingPlan,
    loadingSequence,
    generateLoadingSequence,
    savedTemplates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    isAnimating,
    setIsAnimating,
    currentAnimationStep,
    setCurrentAnimationStep,
    activeTab,
    setActiveTab,
  };
  
  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}; 