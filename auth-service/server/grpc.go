package server

import (
	"auth-service/auth_proto"
	"auth-service/config"
	"auth-service/jwt"
	usersRepositories "auth-service/users/repositories"
	usersUsecases "auth-service/users/usecases"
	"context"
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
)

type GRPCServer struct {
	auth_proto.UnimplementedAuthServiceServer
	server Server
}

func GRPCListen(server Server, cfg *config.Config) {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", cfg.App.GRPCPort))
	if err != nil {
		log.Fatalf("failed to listen for gRPC: %v", err)
	}

	grpcServer := grpc.NewServer()

	auth_proto.RegisterAuthServiceServer(grpcServer, &GRPCServer{server: server})

	log.Println("gRPC server listening on port:",cfg.App.GRPCPort)

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve gRPC: %v", err)
	}
}

func (a *GRPCServer) Authorization(ctx context.Context, req *auth_proto.AuthorizationRequest) (*auth_proto.AuthorizationResponse, error) {
	log.Println("Recieving gRPC connection for authorization....")
	// Extract the token and requiredRole from the request
	token := req.GetToken()
	requiredRole := req.GetRequiredRole()

	tokenClaim, err := jwt.ValidateAndExtractToken(token)
	if err != nil {
		log.Println("Error while validating token: ", err)
		if err.StatusCode == 401 {
			return &auth_proto.AuthorizationResponse{IsAuthorized: false}, nil
		}
		return nil, err
	}

	role := tokenClaim.Role
	result := jwt.HasAuthorizeRole(role, requiredRole, true)
	
	log.Println("Authorization result: ", result)
	// Return the response
	return &auth_proto.AuthorizationResponse{IsAuthorized: result}, nil
}

func (a *GRPCServer) VerifyUsername(ctx context.Context, req *auth_proto.VerifyUsernameRequest) (*auth_proto.VerifyUsernameResponse, error) {
	username := req.GetUsername()
	usersPostgresRepository := usersRepositories.NewUsersPostgresRepository(a.server.GetDB())
	usersUsecase := usersUsecases.NewUsersUsecaseImpl(
		usersPostgresRepository,
		nil,
	)

	result, err := usersUsecase.VerifyUsername(username)
	if err != nil {
		return nil, err
	}

	return &auth_proto.VerifyUsernameResponse{IsVerified: result}, nil
}
