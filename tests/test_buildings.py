def test_create_building(client):
    # Регистрируем пользователя и получаем токен
    auth_response = client.post("/register", json={
        "username": "owner",
        "email": "owner@example.com",
        "password": "password123"
    })
    token = auth_response.json()["access_token"]
    
    # Создаем здание
    response = client.post(
        "/buildings/",
        json={"name": "Тестовое здание", "address": "ул. Тестовая, 1"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Тестовое здание"

def test_get_buildings(client):
    response = client.get("/buildings/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_building(client):
    # Регистрируем пользователя и получаем токен
    auth_response = client.post("/register", json={
        "username": "editor",
        "email": "editor@example.com",
        "password": "password123"
    })
    token = auth_response.json()["access_token"]

    # Создаем здание
    create_response = client.post(
        "/buildings/",
        json={"name": "Здание для редактирования", "address": "ул. Прежняя, 5"},
        headers={"Authorization": f"Bearer {token}"}
    )
    building_id = create_response.json()["id"]

    # Обновляем здание
    update_response = client.put(
        f"/buildings/{building_id}",
        json={"name": "Обновленное здание", "address": "ул. Новая, 10"},
        headers={"Authorization": f"Bearer {token}"}
    )

    assert update_response.status_code == 200
    data = update_response.json()
    assert data["name"] == "Обновленное здание"
    assert data["address"] == "ул. Новая, 10"

def test_delete_building(client):
    # Регистрируем пользователя и получаем токен
    auth_response = client.post("/register", json={
        "username": "deleter",
        "email": "deleter@example.com",
        "password": "password123"
    })
    token = auth_response.json()["access_token"]

    # Создаем здание
    create_response = client.post(
        "/buildings/",
        json={"name": "Удаляемое здание", "address": "ул. Удалить, 9"},
        headers={"Authorization": f"Bearer {token}"}
    )
    building_id = create_response.json()["id"]

    # Удаляем здание
    delete_response = client.delete(
        f"/buildings/{building_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert delete_response.status_code == 204

    # Проверяем, что здание действительно удалено
    get_response = client.get(
        f"/buildings/{building_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert get_response.status_code == 404
