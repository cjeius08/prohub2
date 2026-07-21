# Unity Scene Setup Guide

## Fastest Setup

1. Open Unity Hub.
2. Create a new `3D Core` project.
3. Copy this prototype's `Assets` folder into the Unity project.
4. Wait for Unity to compile.
5. Create a new empty scene.
6. Click `Shih Tzu Farm > Build Prototype Scene`.
7. Press Play.

The scene builder creates:

- Cute Shih Tzu player
- Isometric follow camera
- Farm ground and dirt path
- Apple garden starting area
- Market sell stall
- Upgrade shop
- Locked chicken, cow, flower, and forest areas
- Resource spawners
- HUD, shop UI, pause UI

## Manual Setup

Use this if you want to build the scene yourself.

### 1. Player

Create an empty GameObject named `Cute Shih Tzu Player`.

Add:

- `CharacterController`
- `PlayerController`

Set tag:

- `Player`

Suggested child placeholder shapes:

- Capsule body
- Sphere head
- Two sphere ears
- Two black sphere eyes
- Small black nose
- Capsule tail

Optional animation:

- Add an `Animator`
- Create parameters:
  - `Speed` as Float
  - `IsRunning` as Bool
- Assign the Animator to `PlayerController.animator`

### 2. Camera

Create a Camera and add:

- `CameraFollow`

Assign:

- `target` = `Cute Shih Tzu Player`

Suggested offset:

```text
X 0, Y 10, Z -9
```

### 3. Managers

Create an empty GameObject named `Game Managers`.

Add:

- `GameManager`
- `InventoryManager`
- `UpgradeManager`
- `UIManager`

Connect:

- `GameManager.inventoryManager` -> `InventoryManager`
- `GameManager.upgradeManager` -> `UpgradeManager`
- `GameManager.uiManager` -> `UIManager`
- `UpgradeManager.player` -> `Cute Shih Tzu Player`
- `UIManager.upgradeManager` -> `UpgradeManager`

### 4. Collectible Prefabs

Create primitive objects for resources.

Examples:

- Apple = red sphere
- Egg = cream sphere
- Milk = blue cube
- Flower = pink sphere
- Wood = brown cube

Add:

- Collider set to `Is Trigger`
- `CollectibleItem`

Set:

- `itemName`
- `amount`
- `basePickupRange`

Make each collectible into a prefab.

### 5. Resource Spawners

Create empty GameObjects around the farm.

Add:

- `ResourceSpawner`

Assign:

- `collectiblePrefab`
- `itemName`
- `amount`
- `respawnSeconds`

### 6. Sell Zone

Create a market stall using cubes.

Create a child trigger object with:

- BoxCollider set to `Is Trigger`
- `SellZone`

When the player enters the trigger, all inventory goods sell automatically.

### 7. Upgrade Shop

Create a shop object.

Add:

- BoxCollider set to `Is Trigger`
- `ShopManager`

Assign:

- `ShopManager.upgradeManager`

When the player enters the shop trigger, press `E` to open the shop UI.

### 8. Unlock Areas

Create locked area gate objects.

Create a trigger in front of each gate.

Add:

- BoxCollider set to `Is Trigger`
- `UnlockArea`

Assign:

- `areaName`
- `unlockCost`
- `lockedVisual`
- `areaContent`

The `areaContent` GameObject should contain better resource spawners and starts inactive.

### 9. UI

Create a Canvas.

Add Text objects for:

- Coins
- Inventory
- Goods list
- Objective
- Messages
- Floating pickup text

Create a Shop Panel with buttons for:

- Speed
- Backpack
- Collection Range
- Item Value
- Faster Farming

Connect the buttons to methods on `ShopManager`:

- `BuySpeed`
- `BuyBackpack`
- `BuyRange`
- `BuyValue`
- `BuyFarming`

### 10. Recommended First Test

Press Play and test:

1. Move with `WASD`.
2. Hold `Shift` to run.
3. Walk near apples.
4. Confirm inventory increases.
5. Walk to market stall.
6. Confirm coins increase.
7. Walk to shop and press `E`.
8. Buy backpack or speed upgrade.
9. Walk to a locked gate and press `E` after earning enough coins.
