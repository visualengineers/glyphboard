export interface JsonFeature {
  id: number;
  'default-context': string;
  features: Features;
  values: { [key: string]: string };
}

export interface Features {
  '1': { [key: string]: number };
}

export interface Question {
  id: string;
  label: string;
  customerId: string;
}

export interface Answer {
  featureId: number;
  answers: {
    [key: string]: boolean;
  };
}

/** Single data object */
export interface DataObject {
  id: string;
  text: string;
  questions: Question[];
  // TODO: Glyphboard handles this in separate positions file
  position: {
    x: number;
    y: number;
  };
  isLabeled: boolean;
  selectionScore: number;
  // ! Breaking with glyphboards currently irritating naming convention
  /** Numeric Value of a feature */
  featureValues: { [key: string]: number };
  /** Human readable representation of feature */
  featureRepresentations: { [key: string]: string };
}

/** Data set returned from backend */
export interface DataSet {
  dataObjects: DataObject[];
  datasetId: string;
  metrics: [
    {
      versionId: string;
      metrics: {
        [key: string]: number;
      };
    }
  ];
}

// This if the case if we send after each answer
/** (Single) labeled answer to be sent to backend */
export interface LabelOutput {
  dataObjectId: string;
  dataSetId: string; // redundant?
  userId: string;
  questionId: string;
  customerId: string;
  /** Options might change in the future */
  answer: 'yes' | 'no' | 'maybe';
}
