# Shih Tzu Farm Game Prototype

A cute 3D cartoon-style PC farming/collection prototype for Unity.

## Unity Version

Recommended: Unity 2021 LTS or newer.

## Quick Setup

1. Create a new Unity 3D project.
2. Copy the `Assets` folder from this prototype into your Unity project.
3. Open Unity and wait for scripts to compile.
4. Create a new empty scene.
5. In the top menu, click `Shih Tzu Farm > Build Prototype Scene`.
6. Press Play.

## Controls

- `WASD` = move
- `Shift` = run
- `E` = interact with shop or unlock areas
- `Esc` = pause

## Gameplay Loop

1. Walk the Shih Tzu near resources to auto-collect them.
2. Inventory fills up as goods are collected.
3. Go to the market stall sell zone to convert goods into coins.
4. Use coins at the shop to buy upgrades.
5. Unlock new areas with better resources.

## Main Scripts

- `PlayerController.cs`
- `CameraFollow.cs`
- `CollectibleItem.cs`
- `InventoryManager.cs`
- `SellZone.cs`
- `ShopManager.cs`
- `UpgradeManager.cs`
- `UnlockArea.cs`
- `ResourceSpawner.cs`
- `UIManager.cs`
- `GameManager.cs`

## Placeholder Visuals

The prototype uses Unity primitives:

- Capsule and spheres for the Shih Tzu dog
- Cubes and cylinders for the shop, market stall, fences, and locked gates
- Spheres/cubes/capsules for apples, eggs, milk, flowers, wood, and other resources

You can replace these with real 3D assets later without changing the core gameplay scripts.
