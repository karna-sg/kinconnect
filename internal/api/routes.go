package api

import (
	"families-linkedin/internal/service"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(router *gin.Engine, familyService *service.FamilyService, connectionService *service.ConnectionService) {
	// Create API handlers
	familyHandler := NewFamilyHandler(familyService)
	connectionHandler := NewConnectionHandler(connectionService)
	personHandler := NewPersonHandler(familyService)

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Family routes
		families := v1.Group("/families")
		{
			families.POST("", familyHandler.CreateFamily)
			families.GET("/:id", familyHandler.GetFamily)
			families.PUT("/:id", familyHandler.UpdateFamily)
			families.DELETE("/:id", familyHandler.DeleteFamily)
			families.GET("", familyHandler.SearchFamilies)
			families.GET("/:id/members", familyHandler.GetFamilyMembers)
			families.POST("/:id/members", familyHandler.AddFamilyMember)
			families.POST("/:id/connections", familyHandler.CreateFamilyConnection)
			families.GET("/:id/trust-score", familyHandler.GetFamilyTrustScore)
			families.POST("/:id/trust-score/calculate", familyHandler.CalculateFamilyTrustScore)
		}

		// Person routes
		persons := v1.Group("/persons")
		{
			persons.GET("/:id", personHandler.GetPerson)
			persons.PUT("/:id", personHandler.UpdatePerson)
			persons.GET("/:id/matches", personHandler.GetEligibleMatches)
			persons.GET("", personHandler.SearchEligiblePersons)
		}

		// Connection routes
		connections := v1.Group("/connections")
		{
			connections.GET("/path", connectionHandler.FindConnectionPath)
			connections.GET("/paths", connectionHandler.FindMultipleConnectionPaths)
			connections.GET("/common", connectionHandler.FindCommonConnections)
			connections.GET("/network/:familyId", connectionHandler.GetFamilyNetwork)
			connections.GET("/stats", connectionHandler.GetNetworkStats)
			connections.POST("", connectionHandler.CreateConnection)
			connections.GET("/analyze", connectionHandler.AnalyzeConnectionStrength)
		}
	}
}