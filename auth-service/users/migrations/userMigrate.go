package migrations

import (
	"auth-service/config"
	"auth-service/database"
	"auth-service/users/entities"
	"auth-service/users/helper"
	"log/slog"

	"gorm.io/gorm"
)

// UsersMigrate migrates the users in the database.
//
// It takes a database instance as the parameter.
// It returns an error if there was an issue during the migration process.
func UsersMigrate(db database.Database) error {
	// 1. Get super admin username and password from env
	cfg := config.GetConfig()
	// 2. Check if super admin already exists
	users, err := getAllUsers(db.GetDb())
	if err != nil {
		return err
	}

	// Migrate super admin entities
	if err = migrateUserEntities(&cfg.User.SuperAdmin, users, db); err != nil {
		return err
	}

	// Migrate admin entities
	if err = migrateUserEntities(&cfg.User.Admins, users, db); err != nil {
		return err
	}

	// Migrate user entities
	if err = migrateUserEntities(&cfg.User.Users, users, db); err != nil {
		return err
	}

	return nil
}

func migrateUserEntities(user *config.UserCredential, users []*entities.Users, db database.Database) error {
	if foundUser := helper.GetUserFromUserLists(users, user.Username); foundUser != nil {
		slog.Warn("Migrating user, user already exsits", slog.String("role", user.Role))
		return nil
	}

	uuid, err := helper.GenerateUUID()
	if err != nil {
		slog.Error("Failed to generate UUID", slog.String("error", err.Error()))
		return err
	}
	password, salt, err := helper.GenerateHashedSaltedPassword(user.Password)
	if err != nil {
		slog.Error("Failed to generate hashed salted password", slog.String("error", err.Error()))
		return err
	}

	u := &entities.Users{
		Id:        uuid,
		Username:  user.Username,
		Password:  password,
		Salt:      salt,
		Email:     user.Email,
		Role:      user.Role,
		Is_Active: true,
	}

	if err = insertUser(db.GetDb(), u); err != nil {
		slog.Error("Failed to insert user", slog.String("error", err.Error()))
		return err
	}

	slog.Info("Success ; Migrating user", slog.String("role", user.Role))
	return nil
}

func getAllUsers(db *gorm.DB) ([]*entities.Users, error) {
	users := make([]*entities.Users, 0)
	if err := db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func insertUser(db *gorm.DB, user *entities.Users) error {
	if err := db.Create(user).Error; err != nil {
		return err
	}
	return nil
}
