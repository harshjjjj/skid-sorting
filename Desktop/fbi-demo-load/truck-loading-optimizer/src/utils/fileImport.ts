import Papa from 'papaparse';
import { Skid } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse a CSV file and convert it to an array of Skid objects
 * @param file CSV file
 * @returns Promise resolving to an array of parsed Skid objects
 */
export const parseCsvToSkids = (file: string | File): Promise<Skid[]> => {
  return new Promise((resolve, reject) => {
    const parseOptions = {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        try {
          const skids: Skid[] = results.data.map((row: any) => {
            // Handle backward compatibility for canBeStacked -> isStackable
            const stackable = 
              row.isStackable?.toLowerCase() === 'yes' || 
              row.isStackable === 'true' || 
              // Support for legacy property name
              row.canBeStacked?.toLowerCase() === 'yes' || 
              row.canBeStacked === 'true' || 
              false;
              
            return {
              id: uuidv4(),
              label: row.label || `Skid-${uuidv4().slice(0, 8)}`,
              width: parseFloat(row.width) || 0,
              length: parseFloat(row.length) || 0,
              height: parseFloat(row.height) || 0,
              weight: parseFloat(row.weight) || 0,
              priority: parseInt(row.priority) || 1,
              isStackable: stackable,
              maxWeightOnTop: parseFloat(row.maxWeightOnTop) || 0,
              isFragile: row.isFragile?.toLowerCase() === 'yes' || row.isFragile === 'true' || false,
              description: row.description || '',
              specialHandling: row.specialHandling || '',
            };
          });
          resolve(skids);
        } catch (error) {
          reject(new Error('Failed to parse CSV file. Please check the format.'));
        }
      },
      error: (error: Papa.ParseError) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    };
    
    if (typeof file === 'string') {
      Papa.parse(file, parseOptions);
    } else {
      Papa.parse(file as any, parseOptions);
    }
  });
};

/**
 * Generate a CSV template for skid import
 * @returns CSV template as a string
 */
export const generateCsvTemplate = (): string => {
  const headers = [
    'label',
    'width',
    'length',
    'height',
    'weight',
    'priority',
    'isStackable',
    'maxWeightOnTop',
    'isFragile',
    'description',
    'specialHandling',
  ];
  
  const sampleData = [
    'Skid-1,1.2,1.0,0.8,500,1,yes,200,no,Electronics,Fragile items',
    'Skid-2,1.1,1.2,1.0,750,2,yes,0,yes,Glassware,Handle with care',
    'Skid-3,0.9,1.1,1.2,400,1,no,0,yes,Fragile goods,Do not stack',
  ];
  
  return [headers.join(','), ...sampleData].join('\n');
};

/**
 * Validate imported skids data
 * @param skids Array of Skid objects to validate
 * @returns Array of validation error messages (empty if valid)
 */
export const validateSkids = (skids: Skid[]): string[] => {
  const errors: string[] = [];
  
  if (skids.length === 0) {
    errors.push('No skids found in the imported file.');
    return errors;
  }
  
  skids.forEach((skid, index) => {
    if (skid.width <= 0 || skid.length <= 0 || skid.height <= 0) {
      errors.push(`Skid #${index + 1} (${skid.label}): Dimensions must be greater than zero.`);
    }
    
    if (skid.weight < 0) {
      errors.push(`Skid #${index + 1} (${skid.label}): Weight cannot be negative.`);
    }
    
    if (skid.priority <= 0) {
      errors.push(`Skid #${index + 1} (${skid.label}): Priority must be greater than zero.`);
    }
    
    if (skid.isStackable && skid.maxWeightOnTop !== undefined && skid.maxWeightOnTop < 0) {
      errors.push(`Skid #${index + 1} (${skid.label}): Max weight on top cannot be negative.`);
    }
  });
  
  return errors;
}; 