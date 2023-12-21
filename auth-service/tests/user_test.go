package tests

import (
	"auth-service/config"
	"auth-service/database"
	usersHandlers "auth-service/users/handlers"
	usersMigrate "auth-service/users/migrations"
	"auth-service/users/models"
	usersRepositories "auth-service/users/repositories"
	usersUsecases "auth-service/users/usecases"
	"fmt"
)

func setUpTestEnvironment() usersHandlers.UsersHandler {
	config.InitializeViper("../")
	cfg := config.GetConfig()
	fmt.Println("CONFIG",cfg)
	db := database.NewPostgresDatabase(&cfg)

	err := usersMigrate.UsersMigrate(db)
	if err != nil {
		_ = fmt.Errorf("failed to migrate %w", err)
		return nil
	}

	usersPostgresRepository := usersRepositories.NewUsersPostgresRepository(db.GetDb())
	userEmailRepository := usersRepositories.NewUserJordanWrightEmailing(cfg.Email.SenderName, cfg.Email.SenderEmail, cfg.Email.SenderPassword)
	usersUsecase := usersUsecases.NewUsersUsecaseImpl(
		usersPostgresRepository,
		userEmailRepository,
	)

	usersHttpHandler := usersHandlers.NewUsersHttpHandler(usersUsecase)

	return usersHttpHandler
}

func getResetPasswordToken(cfg config.Config, email string) (string, error) {
	db := database.NewPostgresDatabase(&cfg)
	usersPostgresRepository := usersRepositories.NewUsersPostgresRepository(db.GetDb())
	userEmailRepository := usersRepositories.NewUserJordanWrightEmailing(cfg.Email.SenderName, cfg.Email.SenderEmail, cfg.Email.SenderPassword)
	usersUsecase := usersUsecases.NewUsersUsecaseImpl(
		usersPostgresRepository,
		userEmailRepository,
	)
	token, err := usersUsecase.ForgetPassword(&models.ForgetPassword{
		Email: email,
	})

	return token, err
}
