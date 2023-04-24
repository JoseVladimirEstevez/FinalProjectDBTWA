import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { useState } from 'react';
import './Graph.css';

function Graph() {

    const [username, setUserName] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [xyz, setImage] = useState("");
    const navigate = useNavigate();

    const handleImage = async (e) => {
        e.preventDefault();
    
        const loginURL = 'http://localhost:8080/file/file';
        const options = {
            method: 'GET',
            
        }
        const response = await fetch(loginURL, options);
        console.log('response.status: ', response.status);
    
        if(response.status == 200) {
          const blob = await response.blob();
          const imgUrl = URL.createObjectURL(blob);
          //console.log('imgUrl: ', imgUrl);
    
          const img = new Image();
          img.src = imgUrl;
          setImage(imgUrl)
          //document.body.appendChild(img);
        }
    }


    // On component load -> check auth
    useEffect(() => {
        // Verify auth
        const token = localStorage.getItem('token');
        if(!token) {
            navigate('/login');
            return
        } try {
            const decodedToken = jwt_decode(token);
            setUserName(decodedToken.username);
            setIsAdmin(decodedToken.isAdmin);
        } catch(err) {
            console.error(err);
            navigate('/login');
            return
        }
    }, [])

    return(
        <div>
            <h1>Graph</h1>
            <button className='btn btn-success'  onClick={handleImage}>
                MAP
            </button>
        <div className="container-flex">
            <div className="row my-2">
                <div className="col">
                    <div className='btn-group buttonDropdown'>
                        <button className='btn btn-secondary dropdown-toggle' type='button' id='defaultDropdown' data-bs-toggle='dropdown' data-bs-auto-close='true' aria-expanded='false'>
                            C02    
                        </button>
                        <ul className='dropdown-menu' aria-labelledby='defaultDropdown'>
                            <li><a className='dropdown-item' href='#'>C02</a></li>
                            <li><a className='dropdown-item' href='#'>All GHGs</a></li>
                            <li><a className='dropdown-item' href='#'>Methane</a></li>
                            <li><a className='dropdown-item' href='#'>Nitrous Oxide</a></li>
                        </ul>
                    </div>
                </div>
                <div className="col order-5 d-flex">
                    <div className="form-check align-self-center">
                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                        <label className="form-check-label" htmlFor="flexCheckDefault">
                            Relative to world total
                        </label>
                    </div>
                </div>
                <div className="col order-1">
                    <div className='btn-group buttonDropdown'>
                        <button className='btn btn-secondary dropdown-toggle' type='button' id='defaultDropdown' data-bs-toggle='dropdown' data-bs-auto-close='true' aria-expanded='false'>
                            Per capita
                        </button>
                        <ul className='dropdown-menu' aria-labelledby='defaultDropdown'>
                            <li><a className='dropdown-item' href='#'>Per capita</a></li>
                            <li><a className='dropdown-item' href='#'>Per country</a></li>
                            <li><a className='dropdown-item' href='#'>Cumulative</a></li>
                            <li><a className='dropdown-item' href='#'>Per MWh of Energy</a></li>
                            <li><a className='dropdown-item' href='#'>Per $ of GDP</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className='row my-2'>
                <div className='col col-2 buttonDropdown'>
                    <ul className='text-left'>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Argentina</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Australia</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Brazil</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Canada</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />China</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />France</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Germany</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />India</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Indonesia</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Japan</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Mexico</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Russia</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />Ukraine</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />United Kingdom</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />United States</li>
                        <li className='checkBoxHigh text-left'><input type="checkbox" />World</li>
                    </ul>
                </div>
                <div className='col col-9 d-flex'>
                    <span className='align-self-center'>
                        <img src={xyz} alt="" className='imageSize'/>
                    </span>
                </div>
            </div>
            <div className='row my-2'>
                <div className='col col-3'>
                    <div typeof='button' className='btn btn-primary regularButton'>
                        Generate Graph
                    </div>
                </div>
                <div className='col col-2'></div>
                <div className='col col-2'>
                    <div typeof='button' className='btn btn-primary regularButton'>
                        Save
                    </div>
                </div>
                <div className='col col-2'>
                    <div typeof='button' className='btn btn-primary regularButton'>
                        Download
                    </div>
                </div>
                <div className='col col-2'></div>
            </div>
        </div>
        </div>
    )
}

export default Graph