import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet'
import axios from 'axios'

import api from './../../services/api'
import './CreatePoint.css';
import logo from '../../assets/logo.svg'

interface Item{
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse{
    sigla: string
}

interface IBGECityesponse{
    nome: string
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([])
    const [ufs, setUFs] = useState<string[]>([])
    const [citys, setCitys] = useState<string[]>([])
    const [initialPosition, setinitialPosition] = useState<[number, number]>([0, 0])

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [selectedUf, setSelectedUf] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

    const history = useHistory()

    useEffect(() =>{
        api.get('items').then(response =>{
            setItems(response.data)
        })
    }, [])

    useEffect(() =>{
        axios.get<IBGEUFResponse[]>('http://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
            const ufInitials = response.data.map(uf => uf.sigla)
            setUFs(ufInitials)
        })
    }, [])

    useEffect(() =>{
        if(selectedUf == '0'){
            return
        }

        axios.get<IBGECityesponse[]>(`http://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response =>{
            const cityNames = response.data.map(city => city.nome)
            setCitys(cityNames)
        })

    }, [selectedUf])

    useEffect(() =>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords

            setinitialPosition([latitude, longitude])
        })
    }, [selectedUf])

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value

        setSelectedUf(uf);
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value

        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function handleSelectedItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);

            setSelectedItems(filteredItems)
        }else{
            setSelectedItems([...selectedItems, id]);
        } 
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target
        
        setFormData({
            ...formData,
            [name]: value    
        })
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault()

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name, email, whatsapp, uf, city, latitude, longitude, items 
        }
        
        await api.post("points", data)
        alert("ponto de coleta cadastrado com sucesso")
        history.push('/')
    }

  return (
      <div id="page-create-point">
          <header>
              <img src={logo} alt="Ecoleta"/>
              <Link to="/">
                  <FiArrowLeft/>
                  Voltar Para Home
              </Link>
          </header>

          <form onSubmit={handleSubmit}>
            <h1>Cadastro do <br/> ponto de coleta</h1>  
            <fieldset>
                <legend>
                    <h2>Dados</h2>
                </legend>

                <div className="field">
                    <label htmlFor="name">Nome da entidade</label>
                    <input type="text" name="name" id="name" onChange={handleInputChange}/>
                </div>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" onChange={handleInputChange}/>
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>
                    <h2>endereço</h2>
                    <span>Selecione o endereço no mapa</span>
                </legend>

                <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={selectedPosition}/>
                </Map>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="uf">Estado</label>
                        <select onChange={handleSelectedUf} value={selectedUf} name="if" id="uf">
                            <option value="0">Selecione um estado</option>
                            {ufs.map(uf => (
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select onChange={handleSelectedCity} value={selectedCity} name="city" id="city">
                            <option value="0">Selecione uma cidade</option>
                            {citys.map(city =>(
                                <option key={city} value={city}>{city}</option>
                            ))
                                
                            }
                        </select>
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>
                    <h2>itens de coleta</h2>
                    <span>Selecione um o mais itens abaixo</span>
                </legend>

                <ul className="items-grid">
                    {items.map(item => (
                        <li className={selectedItems.includes(item.id) ? 'selected' : ''} key={item.id} onClick={() => handleSelectedItem(item.id)}>
                            <img src={item.image_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>
                    ))}
                </ul>
            </fieldset>

            <button type="submit">
                Cadastrar ponto de coleta
            </button>
          </form>
      </div>
  )
}

export default CreatePoint;
