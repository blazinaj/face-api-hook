import React, { useState, useContext, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import { Button, Input, ListGroup, ListGroupItem, Spinner } from "reactstrap";

const useFaceApi = (loadedModels, descriptors) => {
  const [image, setImage] = useState(null);
  const [labeledDescriptors, setLabeledDescriptors] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [name, setName] = useState('');
  const [modelsAreLoading, setModelsAreLoading] = useState(false);
  useEffect(() => {
    loadModels().then(() => {
      setModelsAreLoading(true);
    });
  }, []);
  useEffect(() => {
    if (labeledDescriptors.length > 0) {
      setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors));
    }
  }, [labeledDescriptors]);
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models'); // await faceapi.nets.ageGenderNet.loadFromUri('/models')
    // await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
    // await faceapi.nets.mtcnn.loadFromUri('/models')
    // await faceapi.nets.tinyYolov2.loadFromUri('/models')
  };

  const getDescriptorsFromImage = async (htmlElement = "video-feed", label) => {
    await loadModels();
    const input = document.getElementById(htmlElement);
    const result = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor();
    return new faceapi.LabeledFaceDescriptors(label, [result.descriptor]);
  };

  const addDescriptor = (name, descriptor) => {
    let desc = new faceapi.LabeledFaceDescriptors(name, [descriptor]);
    setLabeledDescriptors([...labeledDescriptors, desc]);
  };

  const saveImage = async htmlElement => {
    await loadModels();
    const input = document.getElementById(htmlElement);
    const result = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor();
    addDescriptor(name, result.descriptor);
  };

  const checkForMatch = async htmlElement => {
    await loadModels();
    const input = document.getElementById(htmlElement);
    const singleResult = await faceapi.detectSingleFace(input).withFaceLandmarks().withFaceDescriptor();

    if (singleResult) {
      const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor);
      console.log(bestMatch.toString());
      alert("Hello, " + bestMatch.toString());
    }
  };

  const compareImageToDescriptors = (image, descriptors) => {
    return false;
  };

  const descriptorList = React.createElement(ListGroup, null, labeledDescriptors.map((descriptor, index) => React.createElement(ListGroupItem, {
    key: index
  }, descriptor.label)));
  const saveImageButton = React.createElement(React.Fragment, null, React.createElement(Input, {
    value: name,
    onChange: e => setName(e.target.value)
  }), React.createElement(Button, {
    onClick: () => saveImage("video-feed")
  }, "Save Reference Face"));
  const checkForMatchButton = React.createElement(Button, {
    onClick: () => checkForMatch("video-feed")
  }, "Check For Match");
  const videoFeed = modelsAreLoading ? React.createElement(Spinner, null) : React.createElement(Webcam, {
    id: "video-feed",
    audio: false,
    height: 400,
    ref: webcamRef,
    screenshotFormat: "image/jpeg",
    width: 700,
    videoConstraints: videoConstraints
  });
  return {
    getDescriptorsFromImage,
    compareImageToDescriptors,
    videoFeed,
    nets: faceapi.nets,
    loadModels,
    image: image && React.createElement("img", {
      height: "500px",
      width: "500px",
      id: "face-image",
      src: image,
      alt: "Face Here"
    }),
    checkForMatchButton,
    saveImageButton,
    descriptorList,
    setName,
    name,
    labeledDescriptors
  };
};

export default useFaceApi;