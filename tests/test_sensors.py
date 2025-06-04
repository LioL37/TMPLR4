def test_create_sensor(client):
    # Создаем здание
    auth_response = client.post("/register", json={
        "username": "sensor_owner",
        "email": "sensor@example.com",
        "password": "password123"
    })
    token = auth_response.json()["access_token"]
    building = client.post(
        "/buildings/",
        json={"name": "Здание с датчиком", "address": "ул. Датчикова, 2"},
        headers={"Authorization": f"Bearer {token}"}
    )
    building_id = building.json()["id"]
    
    # Создаем датчик
    response = client.post(
        "/sensors/",
        json={
            "type": "temperature",
            "location": "Комната 101",
            "installed_at": "2023-01-01",
            "building_id": building_id,
            "is_active": True
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    assert response.json()["type"] == "temperature"

def test_update_sensor(client):
    # Регистрация и получение токена
    auth_response = client.post("/register", json={
        "username": "update_sensor_user",
        "email": "update_sensor@example.com",
        "password": "password123"
    })
    token = auth_response.json()["access_token"]

    # Создание здания
    building = client.post(
        "/buildings/",
        json={"name": "Здание для обновления", "address": "ул. Редактирования, 4"},
        headers={"Authorization": f"Bearer {token}"}
    )
    building_id = building.json()["id"]

    # Создание датчика
    sensor = client.post(
        "/sensors/",
        json={
            "type": "temperature",
            "location": "Кухня",
            "installed_at": "2023-02-01",
            "building_id": building_id,
            "is_active": True
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    sensor_id = sensor.json()["id"]

    # Обновление датчика
    updated = client.put(
        f"/sensors/{sensor_id}",
        json={
            "type": "temperature",
            "location": "Гостиная",  # изменили
            "installed_at": "2023-02-01",
            "building_id": building_id,
            "is_active": False  # изменили
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert updated.status_code == 200
    updated_data = updated.json()
    assert updated_data["location"] == "Гостиная"
    assert updated_data["is_active"] is False

def test_delete_sensor(client):
    # Регистрация и токен
    auth_response = client.post("/register", json={
        "username": "delete_sensor_user",
        "email": "delete_sensor@example.com",
        "password": "password123"
    })
    token = auth_response.json()["access_token"]

    # Создание здания
    building = client.post(
        "/buildings/",
        json={"name": "Удаляемое здание", "address": "ул. Удаления, 5"},
        headers={"Authorization": f"Bearer {token}"}
    )
    building_id = building.json()["id"]

    # Создание датчика
    sensor = client.post(
        "/sensors/",
        json={
            "type": "temperature",
            "location": "Прихожая",
            "installed_at": "2023-03-01",
            "building_id": building_id,
            "is_active": True
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    sensor_id = sensor.json()["id"]

    # Удаление датчика
    delete_response = client.delete(
        f"/sensors/{sensor_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert delete_response.status_code == 204

    # Проверка, что он больше не существует
    get_response = client.get(f"/sensors/{sensor_id}")
    assert get_response.status_code == 404
