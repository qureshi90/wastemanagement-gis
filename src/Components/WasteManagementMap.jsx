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

  const carMarker = {
    path: "M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759   c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z    M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713   v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336   h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805",
    fillColor: "red",
    fillOpacity: 2,
    strokeWeight: 1,
    rotation: 0,
    scale: 0.75,
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
                        await deleteDoc(doc(db, "markers", currentPoint.id));
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
              icon={carMarker}
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
