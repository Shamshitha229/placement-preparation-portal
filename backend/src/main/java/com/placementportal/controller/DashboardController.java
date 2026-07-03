package com.placementportal.controller;

import com.placementportal.dto.DashboardResponse;
import com.placementportal.service.DashboardService;
import com.placementportal.util.AuthHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

@Autowired
private DashboardService dashboardService;

@Autowired
private AuthHelper authHelper;

@GetMapping
public ResponseEntity<DashboardResponse> getDashboard() {
    return ResponseEntity.ok(
            dashboardService.getDashboard(
                    authHelper.getCurrentUserId()
            )
    );
}

}
