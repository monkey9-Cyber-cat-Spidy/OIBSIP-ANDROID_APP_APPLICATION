import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonText
} from '@ionic/react';
import React, { useState } from 'react';
import './Home.css';

const Home: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState<boolean>(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operation);
      
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return secondValue !== 0 ? firstValue / secondValue : 0;
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Calculator</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonCard>
          <IonCardContent>
            <IonText>
              <h1 style={{ textAlign: 'right', fontSize: '2rem', margin: '10px 0', minHeight: '60px', padding: '10px', background: '#000', color: '#fff', borderRadius: '5px' }}>
                {display}
              </h1>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton expand="block" fill="solid" color="medium" onClick={clear}>
                C
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="medium" onClick={() => {}}>
                ±
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="medium" onClick={() => {}}>
                %
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="warning" onClick={() => inputOperation('÷')}>
                ÷
              </IonButton>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('7')}>
                7
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('8')}>
                8
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('9')}>
                9
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="warning" onClick={() => inputOperation('×')}>
                ×
              </IonButton>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('4')}>
                4
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('5')}>
                5
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('6')}>
                6
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="warning" onClick={() => inputOperation('-')}>
                -
              </IonButton>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('1')}>
                1
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('2')}>
                2
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('3')}>
                3
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="warning" onClick={() => inputOperation('+')}>
                +
              </IonButton>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="6">
              <IonButton expand="block" fill="solid" color="dark" onClick={() => inputNumber('0')}>
                0
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="dark" onClick={inputDecimal}>
                .
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="block" fill="solid" color="success" onClick={performCalculation}>
                =
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;