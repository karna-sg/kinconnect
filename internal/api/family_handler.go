package api

import (
	"families-linkedin/internal/models"
	"families-linkedin/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FamilyHandler struct {
	familyService *service.FamilyService
}

func NewFamilyHandler(familyService *service.FamilyService) *FamilyHandler {
	return &FamilyHandler{
		familyService: familyService,
	}
}

// CreateFamily creates a new family
func (h *FamilyHandler) CreateFamily(c *gin.Context) {
	var family models.Family
	if err := c.ShouldBindJSON(&family); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate new family if ID is not provided
	if family.ID == "" {
		newFamily := models.NewFamily(family.Name, family.PrimarySurname)
		family.ID = newFamily.ID
		family.CreatedAt = newFamily.CreatedAt
		family.UpdatedAt = newFamily.UpdatedAt
		family.TrustScore = newFamily.TrustScore
		family.ActiveStatus = newFamily.ActiveStatus
		family.Verification = newFamily.Verification
		family.PrivacySettings = newFamily.PrivacySettings
	}

	if err := h.familyService.CreateFamily(c.Request.Context(), &family); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Family created successfully",
		"family":  family,
	})
}

// GetFamily retrieves a family by ID
func (h *FamilyHandler) GetFamily(c *gin.Context) {
	familyID := c.Param("id")
	if familyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	family, err := h.familyService.GetFamily(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"family": family,
	})
}

// UpdateFamily updates an existing family
func (h *FamilyHandler) UpdateFamily(c *gin.Context) {
	familyID := c.Param("id")
	if familyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	var family models.Family
	if err := c.ShouldBindJSON(&family); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	family.ID = familyID

	if err := h.familyService.UpdateFamily(c.Request.Context(), &family); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Family updated successfully",
		"family":  family,
	})
}

// DeleteFamily soft deletes a family
func (h *FamilyHandler) DeleteFamily(c *gin.Context) {
	familyID := c.Param("id")
	if familyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	if err := h.familyService.DeleteFamily(c.Request.Context(), familyID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Family deleted successfully",
	})
}

// SearchFamilies searches for families based on criteria
func (h *FamilyHandler) SearchFamilies(c *gin.Context) {
	var criteria models.FamilySearchCriteria

	// Parse query parameters
	criteria.City = c.Query("city")
	criteria.State = c.Query("state")
	criteria.Caste = c.Query("caste")
	criteria.Religion = c.Query("religion")
	criteria.VerifiedOnly = c.Query("verified_only") == "true"

	if minTrust := c.Query("min_trust_score"); minTrust != "" {
		if score, err := strconv.ParseFloat(minTrust, 64); err == nil {
			criteria.MinTrustScore = score
		}
	}

	if limit := c.Query("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil {
			criteria.Limit = l
		}
	}

	if offset := c.Query("offset"); offset != "" {
		if o, err := strconv.Atoi(offset); err == nil {
			criteria.Offset = o
		}
	}

	families, err := h.familyService.SearchFamilies(c.Request.Context(), &criteria)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"families": families,
		"count":    len(families),
		"criteria": criteria,
	})
}

// GetFamilyMembers retrieves all members of a family
func (h *FamilyHandler) GetFamilyMembers(c *gin.Context) {
	familyID := c.Param("id")
	if familyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	members, err := h.familyService.GetFamilyMembers(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"family_id": familyID,
		"members":   members,
		"count":     len(members),
	})
}

// AddFamilyMember adds a new member to a family
func (h *FamilyHandler) AddFamilyMember(c *gin.Context) {
	familyID := c.Param("id")
	if familyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	var person models.Person
	if err := c.ShouldBindJSON(&person); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	person.FamilyID = familyID

	// Generate new person if ID is not provided
	if person.ID == "" {
		newPerson := models.NewPerson(familyID, person.FirstName, person.LastName, person.Gender, person.DateOfBirth)
		person.ID = newPerson.ID
		person.Age = newPerson.Age
		person.CreatedAt = newPerson.CreatedAt
		person.UpdatedAt = newPerson.UpdatedAt
		person.MaritalStatus = newPerson.MaritalStatus
		person.EligibleForMarriage = newPerson.EligibleForMarriage
		person.ProfileVisibility = newPerson.ProfileVisibility
		person.Preferences = newPerson.Preferences
	}

	if err := h.familyService.AddFamilyMember(c.Request.Context(), &person); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Family member added successfully",
		"person":  person,
	})
}

// CreateFamilyConnection creates a connection between families
func (h *FamilyHandler) CreateFamilyConnection(c *gin.Context) {
	fromFamilyID := c.Param("id")
	if fromFamilyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	var connectionRequest struct {
		ToFamilyID       string  `json:"to_family_id" binding:"required"`
		RelationType     string  `json:"relation_type" binding:"required"`
		SpecificRelation string  `json:"specific_relation" binding:"required"`
		Strength         float64 `json:"strength" binding:"required,min=0,max=1"`
		Verified         bool    `json:"verified"`
		Notes            string  `json:"notes"`
	}

	if err := c.ShouldBindJSON(&connectionRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	connection := models.NewFamilyConnection(
		fromFamilyID,
		connectionRequest.ToFamilyID,
		connectionRequest.RelationType,
		connectionRequest.SpecificRelation,
		connectionRequest.Strength,
		connectionRequest.Verified,
	)

	if connectionRequest.Notes != "" {
		connection.Metadata["notes"] = connectionRequest.Notes
	}

	if err := h.familyService.CreateFamilyConnection(c.Request.Context(), connection); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Family connection created successfully",
		"connection": connection,
	})
}

// GetFamilyTrustScore retrieves the current trust score for a family
func (h *FamilyHandler) GetFamilyTrustScore(c *gin.Context) {
	familyID := c.Param("id")
	if familyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	family, err := h.familyService.GetFamily(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"family_id":   familyID,
		"trust_score": family.TrustScore,
		"updated_at":  family.UpdatedAt,
	})
}

// CalculateFamilyTrustScore recalculates and updates the trust score for a family
func (h *FamilyHandler) CalculateFamilyTrustScore(c *gin.Context) {
	familyID := c.Param("id")
	if familyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Family ID is required"})
		return
	}

	trustScore, err := h.familyService.CalculateFamilyTrustScore(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"family_id":   familyID,
		"trust_score": trustScore,
		"message":     "Trust score calculated and updated successfully",
	})
}
