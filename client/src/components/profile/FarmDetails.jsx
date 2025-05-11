import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLeaf, FaSeedling, FaSave } from 'react-icons/fa';

// Categorized crops matching the Income form structure
const cropCategories = {
  grainsCereals: ['Rice', 'Wheat', 'Corn', 'Bajra', 'Jowar'],
  pulses: ['Chickpeas/Chana', 'Pigeon Peas/Tur Dal', 'Green Gram/Moong Dal', 'Black Gram/Urad Dal', 'Lentils/Masoor Dal'],
  commercialCrops: ['Sugarcane', 'Cotton', 'Oilseeds', 'Tobacco'],
  vegetables: ['Chili', 'Brinjal', 'Tomato', 'Onion', 'Cauliflower', 'Cabbage', 'ladyfinger/Bhinda', 'Leafy Vegetables', 'Other Vegetables'],
  fruits: ['Mango', 'Banana', 'Grapes', 'Papaya', 'Guava', 'Other Fruits'],
  animalProducts: ['Milk', 'Eggs', 'Poultry', 'Meat', 'Fish', 'Honey'],
  other: ['Herbs & Medicinal Plants', 'Organic Produce']
};

const FarmDetails = ({ user, updateProfile }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    farmDetails: {
      primaryCrops: user?.farmDetails?.primaryCrops || [],
      farmingType: user?.farmDetails?.farmingType || 'Conventional'
    }
  });

  const handleCropChange = (crop) => {
    setFormData(prev => {
      const updatedCrops = [...prev.farmDetails.primaryCrops];
      
      if (updatedCrops.includes(crop)) {
        // Remove the crop if it's already selected
        const index = updatedCrops.indexOf(crop);
        updatedCrops.splice(index, 1);
      } else {
        // Add the crop if it's not already selected
        updatedCrops.push(crop);
      }
      
      return {
        ...prev,
        farmDetails: {
          ...prev.farmDetails,
          primaryCrops: updatedCrops
        }
      };
    });
  };

  const handleFarmingTypeChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      farmDetails: {
        ...prev.farmDetails,
        farmingType: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setIsEditing(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError(result.error || t('farm.failed'));
      }
    } catch (error) {
      setError(error.message || t('farm.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg mb-6">
      <div className="flex justify-between items-center px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {t('profile.farmDetails')}
        </h3>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('farm.edit') || 'Edit'}
          </button>
        ) : null}
      </div>
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mx-4 mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {t('farm.updated')}
        </div>
      )}
      
      {!isEditing ? (
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <FaLeaf className="mr-2" /> {t('farm.primaryCrops')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.farmDetails?.primaryCrops?.length > 0 
                  ? user.farmDetails.primaryCrops.join(', ') 
                  : '-'
                }
              </dd>
            </div>
            
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <FaSeedling className="mr-2" /> {t('farm.farmingType')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {user.farmDetails?.farmingType
                  ? t(`farm.${user.farmDetails.farmingType.toLowerCase()}`)
                  : '-'
                }
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('farm.primaryCrops')}
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t('farm.selectCropsHelp')}
              </p>
              
              <div className="space-y-4">
                {/* Grains & Cereals */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm pb-1 border-b border-gray-200 dark:border-gray-700">
                    {t('income.grainsCereals')}
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {cropCategories.grainsCereals.map(crop => (
                      <div key={crop} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`crop-${crop}`}
                            name={`crop-${crop}`}
                            type="checkbox"
                            checked={formData.farmDetails.primaryCrops.includes(crop)}
                            onChange={() => handleCropChange(crop)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`crop-${crop}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {crop}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Pulses */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm pb-1 border-b border-gray-200 dark:border-gray-700">
                    {t('income.pulses')}
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {cropCategories.pulses.map(crop => (
                      <div key={crop} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`crop-${crop}`}
                            name={`crop-${crop}`}
                            type="checkbox"
                            checked={formData.farmDetails.primaryCrops.includes(crop)}
                            onChange={() => handleCropChange(crop)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`crop-${crop}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {crop}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Commercial Crops */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm pb-1 border-b border-gray-200 dark:border-gray-700">
                    {t('income.commercialCrops')}
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {cropCategories.commercialCrops.map(crop => (
                      <div key={crop} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`crop-${crop}`}
                            name={`crop-${crop}`}
                            type="checkbox"
                            checked={formData.farmDetails.primaryCrops.includes(crop)}
                            onChange={() => handleCropChange(crop)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`crop-${crop}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {crop}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Vegetables */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm pb-1 border-b border-gray-200 dark:border-gray-700">
                    {t('income.vegetables')}
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {cropCategories.vegetables.map(crop => (
                      <div key={crop} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`crop-${crop}`}
                            name={`crop-${crop}`}
                            type="checkbox"
                            checked={formData.farmDetails.primaryCrops.includes(crop)}
                            onChange={() => handleCropChange(crop)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`crop-${crop}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {crop}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Fruits */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm pb-1 border-b border-gray-200 dark:border-gray-700">
                    {t('income.fruits')}
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {cropCategories.fruits.map(crop => (
                      <div key={crop} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`crop-${crop}`}
                            name={`crop-${crop}`}
                            type="checkbox"
                            checked={formData.farmDetails.primaryCrops.includes(crop)}
                            onChange={() => handleCropChange(crop)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`crop-${crop}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {crop}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Animal Products */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm pb-1 border-b border-gray-200 dark:border-gray-700">
                    {t('income.animalProducts')}
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {cropCategories.animalProducts.map(crop => (
                      <div key={crop} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`crop-${crop}`}
                            name={`crop-${crop}`}
                            type="checkbox"
                            checked={formData.farmDetails.primaryCrops.includes(crop)}
                            onChange={() => handleCropChange(crop)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`crop-${crop}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {crop}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Other */}
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm pb-1 border-b border-gray-200 dark:border-gray-700">
                    {t('income.other')}
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                    {cropCategories.other.map(crop => (
                      <div key={crop} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={`crop-${crop}`}
                            name={`crop-${crop}`}
                            type="checkbox"
                            checked={formData.farmDetails.primaryCrops.includes(crop)}
                            onChange={() => handleCropChange(crop)}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={`crop-${crop}`} className="font-medium text-gray-700 dark:text-gray-300">
                            {crop}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('farm.farmingType')}
              </label>
              <div className="mt-2 space-y-2">
                {['Organic', 'Conventional', 'Mixed'].map(type => (
                  <div key={type} className="flex items-center">
                    <input
                      id={`farmingType-${type}`}
                      name="farmingType"
                      type="radio"
                      value={type}
                      checked={formData.farmDetails.farmingType === type}
                      onChange={handleFarmingTypeChange}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                    />
                    <label htmlFor={`farmingType-${type}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t(`farm.${type.toLowerCase()}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('farm.cancel') || 'Cancel'}
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-800"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {t('farm.saving') || 'Saving...'}
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> {t('farm.saveFarmDetails')}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FarmDetails; 