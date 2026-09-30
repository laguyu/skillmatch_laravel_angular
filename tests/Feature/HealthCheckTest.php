<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_the_health_check_reports_that_the_application_is_available(): void
    {
        $response = $this->getJson('/up');

        $response->assertOk()
            ->assertExactJson(['status' => 'ok']);
    }
}
