import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { play, pause, square, flag, refresh } from 'ionicons/icons';
import './Home.css';

interface LapTime {
  id: number;
  time: string;
  lapTime: string;
}

const Home: React.FC = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastLapTime, setLastLapTime] = useState(0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setTime(0);
    setIsRunning(false);
    setLaps([]);
    setLastLapTime(0);
  };

  const handleLap = () => {
    if (isRunning) {
      const lapTime = time - lastLapTime;
      const newLap: LapTime = {
        id: laps.length + 1,
        time: formatTime(time),
        lapTime: formatTime(lapTime)
      };
      setLaps([newLap, ...laps]);
      setLastLapTime(time);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Stopwatch</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Stopwatch</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <div className="stopwatch-container">
          <IonCard className="time-display-card">
            <IonCardContent>
              <div className="time-display">
                <IonText>
                  <h1 className="time-text">{formatTime(time)}</h1>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>

          <IonGrid>
            <IonRow>
              <IonCol size="6">
                {!isRunning ? (
                  <IonButton
                    expand="block"
                    color="success"
                    onClick={handleStart}
                    className="control-button"
                  >
                    <IonIcon icon={play} slot="start" />
                    Start
                  </IonButton>
                ) : (
                  <IonButton
                    expand="block"
                    color="warning"
                    onClick={handlePause}
                    className="control-button"
                  >
                    <IonIcon icon={pause} slot="start" />
                    Pause
                  </IonButton>
                )}
              </IonCol>
              <IonCol size="6">
                <IonButton
                  expand="block"
                  color="danger"
                  onClick={handleReset}
                  className="control-button"
                >
                  <IonIcon icon={square} slot="start" />
                  Reset
                </IonButton>
              </IonCol>
            </IonRow>
            {isRunning && (
              <IonRow>
                <IonCol>
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={handleLap}
                    className="lap-button"
                  >
                    <IonIcon icon={flag} slot="start" />
                    Lap
                  </IonButton>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>

          {laps.length > 0 && (
            <IonCard className="laps-card">
              <IonCardContent>
                <div className="laps-header">
                  <IonText>
                    <h3>Lap Times</h3>
                  </IonText>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => setLaps([])}
                  >
                    <IonIcon icon={refresh} />
                  </IonButton>
                </div>
                <IonList className="laps-list">
                  {laps.map((lap) => (
                    <IonItem key={lap.id} className="lap-item">
                      <IonLabel>
                        <div className="lap-info">
                          <span className="lap-number">Lap {lap.id}</span>
                          <div className="lap-times">
                            <span className="lap-time">{lap.lapTime}</span>
                            <span className="total-time">{lap.time}</span>
                          </div>
                        </div>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
