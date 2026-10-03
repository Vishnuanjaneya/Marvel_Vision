import {
  useState,
} from "react";

import Camera from "./components/Camera/Camera";

import HeroSelector from "./components/HeroSelector/HeroSelector";

import type {
  HeroPower,
} from "./models/vision";


function App() {

  const [
    selectedPower,
    setSelectedPower,
  ] = useState<HeroPower>(
    "SPIDER_MAN"
  );


  const [
    cameraStarted,
    setCameraStarted,
  ] = useState(false);


  return (

    <main className={`app app-${selectedPower.toLowerCase().replaceAll("_", "-")}`}>

      <header className="app-header">

        <div>

          <p className="eyebrow">
            REAL-TIME COMPUTER VISION
          </p>

          <h1>
            MARVEL VISION
          </h1>

          <p className="header-caption">
            YOUR POWERS. <span>YOUR MOMENT.</span> REAL-TIME.
          </p>

        </div>


        <div
          className={`status ${
            cameraStarted
              ? "online"
              : "offline"
          }`}
        >

          <span />

          {cameraStarted
            ? "CAMERA ONLINE"
            : "CAMERA OFFLINE"}

        </div>

      </header>


      <section className="hero-area">

        <div className="section-heading">
          <div>
            <p className="section-kicker">CHOOSE YOUR SIDE</p>
            <h2>Suit up, hero.</h2>
          </div>
          <p className="section-note">SELECT A POWER TO CALIBRATE YOUR EXPERIENCE</p>
        </div>

        <HeroSelector
          selectedPower={
            selectedPower
          }
          onSelect={
            setSelectedPower
          }
        />


        <Camera
          power={
            selectedPower
          }
          onCameraStateChange={
            setCameraStarted
          }
        />

      </section>

    </main>
  );
}


export default App;