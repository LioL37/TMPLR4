def test_create_incident(client):
    # Создаем датчик
    auth_response = client.post("/register", json={
        "username": "incident_user",
        "email": "incident@example.com",
        "password": "password123"
    })
    token = auth_response.json()["access_token"]
    building = client.post(
        "/buildings/",
        json={
            "name": "Здание с инцидентом",
            "address": "ул. Инцидентная, 3"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    building_id = building.json()["id"]
    sensor = client.post(
        "/sensors/",
        json={
            "type": "smoke",
            "location": "Коридор",
            "installed_at": "2023-01-01",
            "building_id": building_id,
            "is_active": True
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    sensor_id = sensor.json()["id"]
    
    # Создаем инцидент
    response = client.post(
        "/incidents",
        json={
            "level": "high",
            "description": "Задымление",
            "sensor_id": sensor_id
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    assert response.json()["level"] == "high"