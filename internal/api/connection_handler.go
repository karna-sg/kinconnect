package api

import (
	"families-linkedin/internal/models"
	"families-linkedin/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ConnectionHandler struct {
	connectionService *service.ConnectionService
}

func NewConnectionHandler(connectionService *service.ConnectionService) *ConnectionHandler {
	return &ConnectionHandler{
		connectionService: connectionService,
	}
}

// FindConnectionPath finds the shortest path between two families
func (h *ConnectionHandler) FindConnectionPath(c *gin.Context) {
	fromFamilyID := c.Query("from")
	toFamilyID := c.Query("to")

	if fromFamilyID == "" || toFamilyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both 'from' and 'to' family IDs are required"})
		return
	}

	maxDepth := 4 // default
	if depth := c.Query("max_depth"); depth != "" {
		if d, err := strconv.Atoi(depth); err == nil && d > 0 && d <= 6 {
			maxDepth = d
		}
	}

	path, err := h.connectionService.FindConnectionPath(c.Request.Context(), fromFamilyID, toFamilyID, maxDepth)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if path == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "No connection path found",
			"from":    fromFamilyID,
			"to":      toFamilyID,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"path":    path,
		"message": "Connection path found successfully",
	})
}

// FindMultipleConnectionPaths finds multiple paths between two families
func (h *ConnectionHandler) FindMultipleConnectionPaths(c *gin.Context) {
	fromFamilyID := c.Query("from")
	toFamilyID := c.Query("to")

	if fromFamilyID == "" || toFamilyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both 'from' and 'to' family IDs are required"})
		return
	}

	maxDepth := 4 // default
	if depth := c.Query("max_depth"); depth != "" {
		if d, err := strconv.Atoi(depth); err == nil && d > 0 && d <= 6 {
			maxDepth = d
		}
	}

	maxPaths := 3 // default
	if paths := c.Query("max_paths"); paths != "" {
		if p, err := strconv.Atoi(paths); err == nil && p > 0 && p <= 10 {
			maxPaths = p
		}
	}

	paths, err := h.connectionService.FindMultipleConnectionPaths(c.Request.Context(), fromFamilyID, toFamilyID, maxDepth, maxPaths)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"paths":     paths,
		"count":     len(paths),
		"from":      fromFamilyID,
		"to":        toFamilyID,
		"max_depth": maxDepth,
		"message":   "Multiple connection paths found successfully",
	})
}

// FindCommonConnections finds families that are connected to both input families
func (h *ConnectionHandler) FindCommonConnections(c *gin.Context) {
	family1ID := c.Query("family1")
	family2ID := c.Query("family2")

	if family1ID == "" || family2ID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both 'family1' and 'family2' IDs are required"})
		return
	}

	maxDegree := 2 // default
	if degree := c.Query("max_degree"); degree != "" {
		if d, err := strconv.Atoi(degree); err == nil && d > 0 && d <= 4 {
			maxDegree = d
		}
	}

	commonConnections, err := h.connectionService.FindCommonConnections(c.Request.Context(), family1ID, family2ID, maxDegree)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"common_connections": commonConnections,
		"count":              len(commonConnections),
		"family1":            family1ID,
		"family2":            family2ID,
		"max_degree":         maxDegree,
		"message":            "Common connections found successfully",
	})
}

// GetFamilyNetwork retrieves the network connections for a family
func (h *ConnectionHandler) GetFamilyNetwork(c *gin.Context) {
	familyID := c.Param("familyId")
	if familyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	degree := 2 // default
	if d := c.Query("degree"); d != "" {
		if deg, err := strconv.Atoi(d); err == nil && deg > 0 && deg <= 4 {
			degree = deg
		}
	}

	network, err := h.connectionService.GetFamilyNetwork(c.Request.Context(), familyID, degree)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"network": network,
		"message": "Family network retrieved successfully",
	})
}

// GetNetworkStats provides comprehensive statistics about the family network
func (h *ConnectionHandler) GetNetworkStats(c *gin.Context) {
	stats, err := h.connectionService.GetNetworkStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats":   stats,
		"message": "Network statistics retrieved successfully",
	})
}

// CreateConnection creates a new connection between families
func (h *ConnectionHandler) CreateConnection(c *gin.Context) {
	var connectionRequest struct {
		FromFamilyID     string                 `json:"from_family_id" binding:"required"`
		ToFamilyID       string                 `json:"to_family_id" binding:"required"`
		RelationType     string                 `json:"relation_type" binding:"required"`
		SpecificRelation string                 `json:"specific_relation" binding:"required"`
		Strength         float64                `json:"strength" binding:"required,min=0,max=1"`
		Verified         bool                   `json:"verified"`
		Metadata         map[string]interface{} `json:"metadata"`
	}

	if err := c.ShouldBindJSON(&connectionRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	connection := models.NewFamilyConnection(
		connectionRequest.FromFamilyID,
		connectionRequest.ToFamilyID,
		connectionRequest.RelationType,
		connectionRequest.SpecificRelation,
		connectionRequest.Strength,
		connectionRequest.Verified,
	)

	if connectionRequest.Metadata != nil {
		connection.Metadata = connectionRequest.Metadata
	}

	if err := h.connectionService.CreateConnection(c.Request.Context(), connection); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Connection created successfully",
		"connection": connection,
	})
}

// AnalyzeConnectionStrength analyzes the strength of connections in a path
func (h *ConnectionHandler) AnalyzeConnectionStrength(c *gin.Context) {
	fromFamilyID := c.Query("from")
	toFamilyID := c.Query("to")

	if fromFamilyID == "" || toFamilyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both 'from' and 'to' family IDs are required"})
		return
	}

	maxDepth := 4 // default
	if depth := c.Query("max_depth"); depth != "" {
		if d, err := strconv.Atoi(depth); err == nil && d > 0 && d <= 6 {
			maxDepth = d
		}
	}

	// First, find the path
	path, err := h.connectionService.FindConnectionPath(c.Request.Context(), fromFamilyID, toFamilyID, maxDepth)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if path == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "No connection path found for analysis",
			"from":    fromFamilyID,
			"to":      toFamilyID,
		})
		return
	}

	// Analyze the path
	analysis, err := h.connectionService.AnalyzeConnectionStrength(c.Request.Context(), path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"analysis": analysis,
		"message":  "Connection strength analyzed successfully",
	})
}