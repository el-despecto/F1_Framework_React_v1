import * as React from "react";
import "../styles/Main.css";
import  {useState, useEffect} from "react";
import axios from "axios";
import Current from "./Now";
import Hourly from "./Next_day";
import Week from "./Week";

function Main() {
    const [isLoading, setLoading] = useState(true);
    const [city, setCity] = useState('Москва');
    const [lat, setLat] = useState(55.7522);
    const [lon, setLon] = useState(37.6156);
    const [widget, setWidget] = useState('current');
    const [current, setCurrent] = useState([]);
    const [feels_like, setFeels_like] = useState([]);
    const [temp, setTemp] = useState([]);
    const [wind_speed, setWind_speed] = useState([]);
    const [description, setDescription] = useState([]);
    const [day, setHourly] = useState([]);
    const [week, setWeek] = useState([]);
    const [pict, setIcon] = useState('03n');
    const [key_ipgeolocation, setKey1] = useState();
    const [key_openweathermap, setKey2] = useState();
    const citilist = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород',
    'Челябинск', 'Самара', 'Ростов-на-Дону', 'Уфа', 'Омск', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград', 'Новый Уренгой'];
    const options = citilist.map((text, index) => {
        return <option key={index}>{text}</option>;
    });

    useEffect(() => {
        axios.get(`https://home-update.ru/api/ipgeolocation`).then(res => {
            setKey1(res.data[0].key);
        });
        axios.get(`https://home-update.ru/api/openweathermap_yandex`).then(res => {
            setKey2(res.data[0].key);
        });
    }, []);

    function getMyPosition() {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    };
    function onSuccess(geolocationData) {
        setLoading(true);
        setLat(geolocationData.coords.latitude);
        setLon(geolocationData.coords.longitude);
        axios.get(`https://api.ipgeolocation.io/timezone?apiKey=${key_ipgeolocation}&lat=${lat}&lng=${lon}`).then(res => {
            setCity(res.data.geo.city);
            setLoading(false);
        });
    };
    function onError(error) {
      console.log('Информация о местоположении недоступна');
      console.log(error.message);
    };

    useEffect(() => {

        if (key_openweathermap !== undefined) {
            axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}','RUS'&limit=1&appid=${key_openweathermap}`).then(res => {
                setLat(res.data[0].lat);
                setLon(res.data[0].lon);
                console.log('координаты выбранного города', res.data[0].lat, res.data[0].lon)
            });
        };
        if (key_openweathermap !== undefined) {
            axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key_openweathermap}&units=metric`).then(res => {
                setCurrent(res.data.current);
                setDescription(res.data.current.weather[0].description);
                setFeels_like(res.data.current.feels_like);
                setTemp(res.data.current.temp);
                setWind_speed(res.data.current.wind_speed);
                setHourly(res.data.hourly);
                setWeek(res.data.daily);
                setIcon(res.data.current.weather[0].icon);
                setLoading(false);
                console.log('res.data ', res.data)
            });
        };
    }, [city, key_openweathermap]);

    if (isLoading) {
        return <h1>Загружаю</h1>;
    }

    return (
        <main>
            <div className="cover">

                <div className='button'>
                    <button onClick={getMyPosition}>Определить местоположение</button>
                    <select value={city} onChange={e=>setCity(e.target.value)}>
                        <option disabled>Выбрать город</option>
                        {options}
                    </select>

                    <button onClick={e=>setWidget("current")}>Сегодня</button>
                    <button onClick={e=>setWidget("Next_day")}>На 2 дня</button>
                    <button onClick={e=>setWidget("week")}>На неделю</button>
                </div>

                {(widget === "current" && key_openweathermap !== undefined ) &&
                    <div>
                        <Current key1={key_openweathermap} lat={lat} lon={lon} city={city} icon={pict}
                        description={description} feels_like={feels_like} temp={temp} wind_speed={wind_speed}/>
                    </div>
                }

                {widget === "Next_day" &&
                    <div>
                        <div className="city">{city}</div>
                        <div className="widgets">
                        {day.map((value,index) =>
                            <Hourly day={index} temp={value.temp} icon={value.weather[0].icon} key={value.dt}/>
                        )}
                        </div>
                    </div>
                }

                {widget === "week" &&
                    <div>
                        <div className="city">{city}</div>
                        <div className="widgets">
                            {week.map((value,index) =>
                                <Week day={index} temp={value.temp.day} icon={value.weather[0].icon} key={value.dt}/>
                            )}
                        </div>
                    </div>
                }
            </div>
        </main>
    );
};

export default Main;
