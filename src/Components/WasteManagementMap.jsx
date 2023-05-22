/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DirectionsRenderer,
  DirectionsService,
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const WasteManagementMap = () => {
  const [currentLocation, setCurrentLocation] = useState({
    longitude: null,
    latitude: null,
  });
  const [markerType, setMarkerType] = useState("Dustbin");
  const [currentPoint, setCurrentPoint] = useState(null);
  const [markerLocations, setMarkerLocations] = useState([]);
  const [destination, setDestination] = useState(null);
  const [directionResponse, setDirectionResponse] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyB04vgw5u1yAzDbF91d-1lEGCU68g047eU",
  });

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const markerCollectionRef = collection(db, "markers");
  const garbageWeightRef = useRef(null);

  useLayoutEffect(() => {
    getMyLocation();
  }, []);

  const getMyLocation = () => {
    const location = window.navigator && window.navigator.geolocation;

    if (location) {
      location.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setCurrentLocation({ latitude: null, longitude: null });
        }
      );
    }
  };

  const users = async () => {
    const data = await getDocs(markerCollectionRef);
    setMarkerLocations(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    users();
  }, []);

  useEffect(() => {
    onSnapshot(markerCollectionRef, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        setMarkerLocations((prev) => [...prev, { ...doc.data(), id: doc.id }]);
      });
    });
  }, []);

  const center = useMemo(
    () => ({
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
    }),
    [currentLocation]
  );

  const directionsCallback = (response) => {
    if (response.status === "OK") {
      setDirectionResponse(response);
    }
  };

  const carMarker = (vehicleType) => {
    const vehicles = {
      vehicle:
        "M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759   c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z    M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713   v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336   h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805",
      "loader rickshaw":
        "M61.57 229.35v-65.22c0-1.04.25-2.02.68-2.88L110.2 36.47c6.19-14.13 12.72-23.16 21.52-28.82C140.57 1.96 151.13 0 165.42 0h259.29c18.57.08 33.49 4.18 44.38 12.74 11.12 8.75 17.8 21.86 19.59 39.74l22.78 218.03c1.25 14.27.45 25.27-3.74 33.07-4.74 8.81-12.97 13.18-26.14 12.97-3.46-.05-6.24-2.84-6.31-6.28-.6-29.82-15.18-49.72-34.14-59.2-8.18-4.09-17.2-6.27-26.26-6.49-9.04-.22-18.14 1.52-26.49 5.25-19.28 8.61-34.69 28.06-36.78 58.94-.23 3.39-3.06 5.99-6.41 5.99l-223.28.01c-2.4 24.63-23.16 43.87-48.41 43.87-25.48 0-46.38-19.58-48.48-44.51H6.43c-3.55 0-6.43-2.88-6.43-6.44l.05-.77c1.19-38.02 19.77-61.79 43.36-72.27 5.81-2.58 11.93-4.34 18.16-5.3zM308.28 54.46v210.55h14.35l28.48-66.93c.13-.3.28-.59.45-.86 5.06-8.91 9.78-14.04 15.85-17.09 6.04-3.04 12.63-3.64 21.73-3.64h26.8l.67.04c2.45.02 4.57-.26 6.34-.84 1.62-.54 3-1.38 4.1-2.49.72-.72 1.36-1.61 1.9-2.65.5-.93.92-2.01 1.27-3.22V65.77c0-3.1-1.28-5.92-3.33-7.98-2.06-2.05-4.89-3.33-7.98-3.33H308.28zm-12.87 210.55V54.46h-95.38c-3.09 0-5.92 1.28-7.98 3.34-2.05 2.05-3.33 4.88-3.33 7.97V253.7c0 3.1 1.28 5.93 3.33 7.98l.27.28a11.19 11.19 0 0 0 5.87 2.9v-18.2c0-3.24.05-5.89.36-8.78.3-2.76.84-5.5 1.81-8.86l.08-.32c1.17-3.97 2.68-7.49 4.58-10.56 2.01-3.24 4.42-5.95 7.27-8.12 3.62-2.76 6.66-4.19 9.94-4.95 3.12-.73 5.97-.76 9.65-.76h26.35l8.46-89.15c.33-3.52 3.46-6.11 6.99-5.78 3.52.33 6.11 3.46 5.78 6.99l-8.97 94.44v54.2h24.92zM60.57 327.1c-.19.18-.39.34-.61.47A22.13 22.13 0 0 0 70.64 332c-.07-.25-.1-.51-.1-.77v-14.1l-9.97 9.97zm-4.65-3.57c.12-.22.28-.43.47-.62l9.96-9.96H52.26c-.27 0-.53-.04-.77-.11a22.11 22.11 0 0 0 4.43 10.69zm20.54-20.69 9.96-9.96c.19-.19.4-.35.62-.48-3.04-2.34-6.7-3.91-10.69-4.42.07.24.11.5.11.77v14.09zm14.62-6.39c-.13.22-.29.42-.47.61l-9.97 9.97h14.09c.27 0 .53.03.77.1-.51-3.99-2.08-7.65-4.42-10.68zm-.47 26.46c.18.19.34.4.47.62 2.34-3.04 3.91-6.7 4.42-10.69-.24.07-.5.11-.77.11H80.64l9.97 9.96zm-3.57 4.66c-.22-.13-.43-.29-.62-.47l-9.96-9.97v14.1c0 .26-.04.52-.11.77 4-.52 7.65-2.09 10.69-4.43zm-20.69-20.54-9.96-9.97c-.19-.19-.35-.39-.47-.61a22.034 22.034 0 0 0-4.43 10.68c.24-.07.5-.1.77-.1h14.09zm-6.39-14.63c.22.13.42.29.61.48l9.97 9.96v-14.09c0-.27.03-.53.1-.77-3.99.51-7.65 2.08-10.68 4.42zm61.41 8.86h13.17c-2.07-27.17-16.82-45.46-35.38-54.1-8-3.73-16.67-5.69-25.31-5.84-8.67-.14-17.33 1.52-25.26 5.04-18.18 8.07-32.74 26.11-35.36 54.9h12.4c4.11-22.71 23.97-39.92 47.87-39.92 23.89 0 43.75 17.21 47.87 39.92zm279.57 25.84a3.1 3.1 0 0 1-.61.47 22.13 22.13 0 0 0 10.68 4.43c-.06-.25-.1-.51-.1-.77v-14.1l-9.97 9.97zm-4.65-3.57c.13-.22.28-.43.47-.62l9.97-9.96h-14.1c-.26 0-.52-.04-.77-.11a22.11 22.11 0 0 0 4.43 10.69zm20.54-20.69 9.96-9.96c.19-.19.4-.35.62-.48a22.017 22.017 0 0 0-10.69-4.42c.07.24.11.5.11.77v14.09zm14.62-6.39c-.13.22-.28.42-.47.61l-9.97 9.97h14.1c.26 0 .52.03.77.1-.51-3.99-2.09-7.65-4.43-10.68zm-.47 26.46c.19.19.34.4.47.62a22.11 22.11 0 0 0 4.43-10.69c-.25.07-.51.11-.77.11h-14.1l9.97 9.96zm-3.57 4.66c-.22-.13-.43-.29-.62-.47l-9.96-9.97v14.1c0 .26-.04.52-.1.77a22.13 22.13 0 0 0 10.68-4.43zm-20.68-20.54-9.97-9.97c-.19-.19-.34-.39-.47-.61a22.034 22.034 0 0 0-4.43 10.68c.25-.07.51-.1.77-.1h14.1zm-6.4-14.63c.22.13.43.29.61.48l9.97 9.96v-14.09c0-.27.04-.53.1-.77-3.99.51-7.65 2.08-10.68 4.42zm13.54-31.06c26.87 0 48.65 21.78 48.65 48.65 0 26.87-21.78 48.65-48.65 48.65-26.87 0-48.65-21.78-48.65-48.65 0-26.87 21.78-48.65 48.65-48.65zm29.22-101.65h43.88l-11.05-105.9c-1.41-14.21-6.45-24.4-14.77-30.95-8.56-6.73-20.83-9.95-36.44-10l-259.29.03c-11.85 0-20.3 1.43-26.76 5.58-6.49 4.17-11.57 11.45-16.71 23.14l-.77 2.02c6.79.34 12.69 2.01 17.44 5.5 6.79 5 10.74 13.2 10.92 25.77 0 23.82.51 48.16.02 71.9.17 4.92-.25 9.23-1.59 12.91h27.88V65.77c0-6.64 2.73-12.69 7.11-17.07 4.38-4.38 10.42-7.11 17.07-7.11h218.88c6.65 0 12.7 2.73 17.08 7.11 4.37 4.37 7.1 10.42 7.1 17.07v93.92zm45.21 12.72c-.44.09-.89.15-1.36.15h-44.91c-.49 1.4-1.06 2.73-1.72 3.98-1.14 2.15-2.53 4.06-4.16 5.71-2.52 2.53-5.58 4.4-9.18 5.6-3.17 1.05-6.72 1.55-10.62 1.5l-27.21.01c-7.26 0-12.3.37-16 2.23-3.56 1.79-6.65 5.35-10.35 11.83l-29.84 70.13a6.439 6.439 0 0 1-6.08 4.33H200.03c-6.43 0-12.31-2.57-16.66-6.72l-.42-.38c-4.38-4.38-7.1-10.43-7.1-17.08v-81.14h-49.44c-.7.01-1.42.01-2.16 0H74.44v55.95c10.36.23 20.69 2.58 30.15 6.99 22.84 10.63 40.89 33.11 42.83 66.41h191.93c4-32.85 21.81-53.97 43.8-63.8 10.11-4.51 21.1-6.62 32.03-6.35 10.91.27 21.79 2.9 31.68 7.85 21.41 10.71 38.2 32.13 40.88 63.67 4.25-.82 7.05-2.76 8.67-5.79 2.84-5.28 3.27-14 2.25-25.88l-10.36-99.2zM76.57 159.69h50.95c3.72-.22 6.03-1.07 7.29-2.49 1.62-1.84 2.09-5.25 1.93-9.9l-.05-.76V74.96c-.1-8.02-2.15-12.91-5.66-15.49-3.38-2.49-8.48-3.31-14.79-3.01L76.57 159.69zm181.05 57.49h-25.74c-2.87 0-5.06.01-6.74.4-1.52.36-3.06 1.12-5.06 2.64-1.62 1.24-3 2.79-4.16 4.66-1.26 2.04-2.31 4.52-3.16 7.44l-.09.26c-.73 2.53-1.13 4.59-1.35 6.66-.22 2.07-.26 4.43-.26 7.42v18.35h46.56v-47.83z",
      "tractor trolley":
        "M50.84,40.8c10.71,9.17,14.03,23.29,9.8,36.49h32.78c3.12-9.24,12.52-14.54,23.07-10.06l3.79-22.3 c0.64-3.76-3.12-6.93-6.93-6.93H92.19V21.21c0-1.31-1.05-2.4-2.35-2.46v-8.68H86.6v8.68c-1.27,0.09-2.28,1.16-2.28,2.45V38H67.8 c3.16-14.95-0.53-20.06-2.66-35.27C64.3,0.55,62.65,0.06,60.79,0h-38.5c-1.93,0.02-3.27,0.98-3.97,2.98l-2.61,25.15l-5.2,6.14 c-2.27,2.63-1.61,2.02,0.48,5.16c0.36-0.26,0.72-0.52,1.09-0.76C23.02,31.51,40.54,32.8,50.84,40.8L50.84,40.8z M89.38,5.41 c0.15-0.15,0.39-0.16,0.55-0.01c0.15,0.15,0.16,0.39,0.01,0.55c-0.29,0.3-0.18,0.73-0.08,1.13c0.18,0.68,0.34,1.3-0.48,1.77 c-0.19,0.11-0.42,0.04-0.53-0.14S88.82,8.29,89,8.18c0.3-0.17,0.21-0.52,0.11-0.9C88.96,6.68,88.79,6.03,89.38,5.41L89.38,5.41z M87.04,5.41c0.15-0.15,0.39-0.16,0.55-0.01c0.15,0.15,0.16,0.39,0.01,0.55c-0.29,0.3-0.18,0.73-0.08,1.13 c0.18,0.68,0.34,1.3-0.48,1.77c-0.19,0.11-0.42,0.04-0.53-0.14c-0.11-0.19-0.04-0.42,0.14-0.53c0.3-0.17,0.21-0.52,0.11-0.9 C86.61,6.68,86.44,6.03,87.04,5.41L87.04,5.41z M44.45,8.32v18.55c4.29,0.97,8.53,2.3,12.7,4c2.18,0.89,4.75-1.98,4.29-4.29 L58.64,12.6c-0.46-2.31-1.93-4.29-4.29-4.29H44.45L44.45,8.32z M40.19,26.02V8.32h-10.6c-2.36,0-3.75,1.99-4.29,4.29l-1.86,8.02 c-0.53,2.3,1.93,4.25,4.29,4.29C31.93,24.96,36.08,25.33,40.19,26.02L40.19,26.02z M109.85,69c7.19,0,13.03,5.83,13.03,13.03 c0,7.19-5.83,13.02-13.03,13.02s-13.02-5.83-13.02-13.02C96.83,74.83,102.66,69,109.85,69L109.85,69z M27.83,39.79 c15.37,0,27.83,12.46,27.83,27.83c0,15.37-12.46,27.83-27.83,27.83C12.46,95.45,0,82.99,0,67.62C0,52.25,12.46,39.79,27.83,39.79 L27.83,39.79z M27.83,52.66c8.26,0,14.96,6.7,14.96,14.96c0,8.26-6.7,14.96-14.96,14.96c-8.26,0-14.96-6.7-14.96-14.96 C12.87,59.36,19.57,52.66,27.83,52.66L27.83,52.66z M109.85,75.42c3.65,0,6.6,2.96,6.6,6.6c0,3.65-2.96,6.6-6.6,6.6 c-3.65,0-6.6-2.96-6.6-6.6C103.25,78.38,106.21,75.42,109.85,75.42L109.85,75.42z M90.49,46.14h16.45l-0.37,1.9h-16.4L90.49,46.14 L90.49,46.14z M84.72,56.38h22.22l-0.37,1.9H84.39L84.72,56.38L84.72,56.38z M86.77,51.26h20.18l-0.37,1.9H86.44L86.77,51.26 L86.77,51.26z",
      pickup:
        "M78.29,23.33h18.44c5.52,0,4.23-0.66,7.33,3.93l15.53,22.97c3.25,4.81,3.3,3.77,3.3,9.54v18.99 c0,6.15-5.03,11.19-11.19,11.19h-2.28c0.2-0.99,0.3-2.02,0.3-3.07c0-8.77-7.11-15.89-15.89-15.89c-8.77,0-15.89,7.11-15.89,15.89 c0,1.05,0.1,2.07,0.3,3.07H58.14c0.19-0.99,0.3-2.02,0.3-3.07c0-8.77-7.11-15.89-15.89-15.89c-8.77,0-15.89,7.11-15.89,15.89 c0,1.05,0.1,2.07,0.3,3.07h-2.65c-5.66,0-10.29-4.63-10.29-10.29V63.05h64.27V23.33L78.29,23.33z M93.82,74.39 c6.89,0,12.48,5.59,12.48,12.49c0,6.89-5.59,12.48-12.48,12.48c-6.9,0-12.49-5.59-12.49-12.48C81.33,79.98,86.92,74.39,93.82,74.39 L93.82,74.39z M42.54,74.39c6.9,0,12.49,5.59,12.49,12.49c0,6.89-5.59,12.48-12.49,12.48c-6.89,0-12.48-5.59-12.48-12.48 C30.06,79.98,35.65,74.39,42.54,74.39L42.54,74.39z M42.54,83.18c2.04,0,3.7,1.65,3.7,3.7c0,2.04-1.65,3.69-3.7,3.69 c-2.04,0-3.69-1.66-3.69-3.69C38.85,84.83,40.51,83.18,42.54,83.18L42.54,83.18z M93.82,83.09c2.09,0,3.79,1.7,3.79,3.79 c0,2.09-1.7,3.79-3.79,3.79c-2.09,0-3.79-1.7-3.79-3.79C90.03,84.78,91.73,83.09,93.82,83.09L93.82,83.09z M89.01,32.35h3.55 l15.16,21.12v6.14c0,1.49-1.22,2.71-2.71,2.71h-16c-1.53,0-2.77-1.25-2.77-2.77V35.13C86.23,33.6,87.48,32.35,89.01,32.35 L89.01,32.35z M5.6,0h64.26c3.08,0,5.6,2.52,5.6,5.6v48.92c0,3.08-2.52,5.6-5.6,5.6H5.6c-3.08,0-5.6-2.52-5.6-5.6V5.6 C0,2.52,2.52,0,5.6,0L5.6,0z",
    };

    const scale = {
      vehicle: 0.7,
      "loader rickshaw": 0.06,
      "tractor trolley": 0.25,
      pickup: 0.25,
    };

    return {
      path: vehicles[vehicleType ?? "vehicle"],
      fillColor: "red",
      fillOpacity: 2,
      strokeWeight: 1,
      rotation: 0,
      scale: scale[vehicleType ?? "vehicle"],
    };
  };

  const dustBinMarker = (e) => {
    let fillColor = "";

    if (e.storage <= 20) {
      fillColor = "#00FF00";
    } else if (e.storage > 20 && e.storage <= 70) {
      fillColor = "#FFA500";
    } else if (e.storage > 70) {
      fillColor = "#FF0000";
    }

    return {
      path: "M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z",
      fillColor: fillColor,
      fillOpacity: 2,
      strokeWeight: 1,
      rotation: 0,
      scale: 0.04,
    };
  };

  const collectionMarker = {
    path: "M50.7 58.5L0 160H208V32H93.7C75.5 32 58.9 42.3 50.7 58.5zM240 160H448L397.3 58.5C389.1 42.3 372.5 32 354.3 32H240V160zm208 32H0V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192z",
    fillColor: "#549631",
    fillOpacity: 2,
    strokeWeight: 1,
    rotation: 0,
    scale: 0.04,
  };

  const handleGarbageDump = async () => {
    const weight = garbageWeightRef.current.value;

    if (weight !== "") {
      const storage =
        currentUser.role === "House keeper" ||
        currentPoint.type === "Collection Point"
          ? Number(currentPoint.storage) + Number(weight)
          : Number(currentPoint.storage) - Number(weight);
      await updateDoc(doc(db, "markers", currentPoint.id), {
        storage,
      });
    }

    setCurrentPoint(null);
  };

  const waypoints = markerLocations
    .filter((m) => m.type === "Dustbin" && m.storage > 70)
    .map((p) => ({
      location: { lat: p.lat, lng: p.lng },
      stopover: true,
    }));

  return (
    <div className="h-96">
      {!isLoaded ? (
        <h1>Loading...</h1>
      ) : (
        <GoogleMap
          onDblClick={async (e) =>
            currentUser.role === "Admin" &&
            (await addDoc(markerCollectionRef, {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
              type: markerType,
              storage: 0,
            }))
          }
          mapContainerClassName="map-container"
          center={center}
          zoom={10}
        >
          {currentPoint && (
            <InfoWindowF position={currentPoint}>
              <div className="p-4 flex flex-col justify-center items-center">
                <h1>Current Storage: {currentPoint.storage} %</h1>
                {(currentUser.role === "Admin" ||
                  (currentUser.role === "Driver" &&
                    currentPoint.type === "Dustbin")) && (
                  <button
                    onClick={async () => {
                      if (currentUser.role === "Driver") {
                        await updateDoc(doc(db, "markers", currentPoint.id), {
                          storage: 0,
                        });
                      } else if (currentUser.role === "Admin") {
                        await deleteDoc(
                          doc(db, "markers", currentPoint.id)
                        ).then(() => users());
                      }
                      setCurrentPoint(null);
                    }}
                    className="mt-3 px-3 py-1 bg-blue-400 rounded-md"
                  >
                    {currentUser.role === "Admin" ? "Remove" : "Clear"}
                  </button>
                )}
              </div>
            </InfoWindowF>
          )}
          {destination && (
            <DirectionsService
              callback={directionsCallback}
              options={{
                destination,
                origin: { lat: 34.06754708661514, lng: 71.99837788590158 }, // used hardcoded location of cantonement board risalpur
                travelMode: "DRIVING",
                waypoints,
              }}
            />
          )}
          {directionResponse !== null && (
            <DirectionsRenderer
              options={{
                directions: directionResponse,
              }}
            />
          )}
          {currentUser.role === "Driver" && (
            <MarkerF
              onDragEnd={(e) =>
                setCurrentLocation({
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng(),
                })
              }
              draggable
              icon={carMarker(currentUser.vehicleType)}
              position={{ lat: 34.06754708661514, lng: 71.99837788590158 }} // used hardcoded location of cantonement board risalpur
            />
          )}
          {markerLocations
            .filter((m) =>
              currentUser.role === "House keeper" ? m.type === "Dustbin" : true
            )
            .map((e) => (
              <MarkerF
                key={e.lng + e.id}
                icon={
                  e.type === "Dustbin" ? dustBinMarker(e) : collectionMarker
                }
                onClick={() => setCurrentPoint(e)}
                onDblClick={() =>
                  currentUser.role === "Driver" &&
                  e.type !== "Dustbin" &&
                  setDestination(e)
                }
                position={e}
              />
            ))}
        </GoogleMap>
      )}
      {currentUser.role === "Admin" && (
        <div className="flex flex-col items-center mt-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="markerType"
          >
            Select Marker Type
          </label>
          <select
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="markerType"
            value={markerType}
            onChange={(e) => setMarkerType(e.target.value)}
          >
            <option>Dustbin</option>
            <option>Dumping Site</option>
          </select>
        </div>
      )}

      {currentUser.role === "House keeper" && currentPoint && (
        <div className="flex flex-col items-center mt-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="garbageWeight"
          >
            Garbage
          </label>
          <input
            required
            ref={garbageWeightRef}
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="garbageWeight"
            type="text"
          />
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 mt-2 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleGarbageDump}
            >
              Dump
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteManagementMap;
