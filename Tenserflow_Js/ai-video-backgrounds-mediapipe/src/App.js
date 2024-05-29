import "./App.css";
import { NoEffect } from './Components/NoEffect';
import { ColorBackground } from './Components/ColorBackground';
import { BlurBackground } from './Components/BlurBackground';
import { ImageBackground } from './Components/ImageBackground';
import { BlurBackgroundWebWorker } from './Components/webWorker/BlurBackgroundWebWorker';
import { BlurWithOffScreenCanvas } from './Components/BlurWithOffScreenCanvas';
import { BlurWithOffScreenWithOutCanvas } from './Components/BlurWithOffScreenWithOutCanvas';

function App() {
  return (
    // <NoEffect/>
    // <ColorBackground />
    // <BlurBackground/>
    //  <ImageBackground/>
    <BlurBackgroundWebWorker/>
    // <BlurWithOffScreenCanvas/>
    // <BlurWithOffScreenWithOutCanvas/>
  );
}

export default App;