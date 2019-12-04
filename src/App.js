import React from 'react';
import logo from './logo.svg';
import './App.css';
import useFaceApi from "./useFaceApi/index";

function App() {

  const faceApiHook = useFaceApi();

  return (
    <div className="App">
      {
        faceApiHook.saveImageButton
      }
      {
        faceApiHook.checkForMatchButton
      }
      {
        faceApiHook.videoFeed
      }
      {
        faceApiHook.descriptorList
      }
    </div>
  );
}

export default App;
