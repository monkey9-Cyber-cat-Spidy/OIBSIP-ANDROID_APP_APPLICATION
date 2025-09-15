import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText
} from '@ionic/react';
import React, { useState } from 'react';
import './Home.css';

interface ConversionData {
  [key: string]: {
    [key: string]: number;
  };
}

const conversions: ConversionData = {
  length: {
    'mm': 0.001,
    'cm': 0.01,
    'm': 1,
    'km': 1000,
    'in': 0.0254,
    'ft': 0.3048
  },
  weight: {
    'g': 1,
    'kg': 1000,
    'lb': 453.592,
    'oz': 28.3495
  },
  temperature: {
    'C': 1,
    'F': 1,
    'K': 1
  }
};

const Home: React.FC = () => {
  const [category, setCategory] = useState<string>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('cm');
  const [inputValue, setInputValue] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const convertValue = () => {
    if (!inputValue || isNaN(parseFloat(inputValue))) {
      setResult('Please enter a valid number');
      return;
    }

    const value = parseFloat(inputValue);
    let convertedValue: number;

    if (category === 'temperature') {
      convertedValue = convertTemperature(value, fromUnit, toUnit);
    } else {
      const baseValue = value * conversions[category][fromUnit];
      convertedValue = baseValue / conversions[category][toUnit];
    }

    setResult(`${convertedValue.toFixed(4)} ${toUnit}`);
  };

  const convertTemperature = (value: number, from: string, to: string): number => {
    let celsius: number;
    
    switch (from) {
      case 'C': celsius = value; break;
      case 'F': celsius = (value - 32) * 5/9; break;
      case 'K': celsius = value - 273.15; break;
      default: celsius = value;
    }

    switch (to) {
      case 'C': return celsius;
      case 'F': return (celsius * 9/5) + 32;
      case 'K': return celsius + 273.15;
      default: return celsius;
    }
  };

  const getUnitsForCategory = (cat: string): string[] => {
    return Object.keys(conversions[cat] || {});
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Unit Converter</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Convert Units</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>Category</IonLabel>
              <IonSelect 
                value={category} 
                onIonChange={e => {
                  setCategory(e.detail.value);
                  setFromUnit(getUnitsForCategory(e.detail.value)[0]);
                  setToUnit(getUnitsForCategory(e.detail.value)[1] || getUnitsForCategory(e.detail.value)[0]);
                }}
              >
                <IonSelectOption value="length">Length</IonSelectOption>
                <IonSelectOption value="weight">Weight</IonSelectOption>
                <IonSelectOption value="temperature">Temperature</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Enter Value</IonLabel>
              <IonInput 
                type="number" 
                value={inputValue}
                onIonInput={e => setInputValue(e.detail.value!)}
                placeholder="Enter value to convert"
              />
            </IonItem>

            <IonItem>
              <IonLabel>From</IonLabel>
              <IonSelect value={fromUnit} onIonChange={e => setFromUnit(e.detail.value)}>
                {getUnitsForCategory(category).map(unit => (
                  <IonSelectOption key={unit} value={unit}>{unit.toUpperCase()}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>To</IonLabel>
              <IonSelect value={toUnit} onIonChange={e => setToUnit(e.detail.value)}>
                {getUnitsForCategory(category).map(unit => (
                  <IonSelectOption key={unit} value={unit}>{unit.toUpperCase()}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonButton expand="block" onClick={convertValue} style={{marginTop: '20px'}}>
              Convert
            </IonButton>

            {result && (
              <IonCard style={{marginTop: '20px'}}>
                <IonCardContent>
                  <IonText>
                    <h2>Result: {result}</h2>
                  </IonText>
                </IonCardContent>
              </IonCard>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;